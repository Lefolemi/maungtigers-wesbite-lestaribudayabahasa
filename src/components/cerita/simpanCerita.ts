// src/components/cerita/simpanCerita.ts
import { supabase } from "../../backend/supabase";

type SimpanCeritaParams = {
  ceritaId?: number | null; // for edit
  userId: number;
  bahasaId: number;
  judul: string;
  informasi: any; // TipTap JSON
  gambar?: File | null;
  tags: string[];
  status: "draft" | "direview" | "terbit";
};

export async function simpanCerita({
  ceritaId = null,
  userId,
  bahasaId,
  judul,
  informasi,
  gambar,
  tags,
  status,
}: SimpanCeritaParams): Promise<number> {
  let newCeritaId: number;

  // Step 1: Insert shell if new
  if (!ceritaId) {
    const { data, error } = await supabase
      .from("cerita")
      .insert([
        {
          user_id: userId,
          bahasa_id: bahasaId,
          judul: judul || "(untitled)",
          informasi: {}, // placeholder
          gambar: null,
          status,
          terakhir_edit: new Date().toISOString(),
        },
      ])
      .select("cerita_id")
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Failed to create cerita shell");

    newCeritaId = data.cerita_id;
  } else {
    newCeritaId = ceritaId;
  }

  // Step 2: Upload gambar (thumbnail)
  let gambarUrl: string | null = null;
  if (gambar instanceof File) {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(gambar.type)) throw new Error("Format gambar tidak didukung");
    if (gambar.size > 5 * 1024 * 1024) throw new Error("Ukuran gambar terlalu besar");

    const filePath = `cerita/${newCeritaId}/${Date.now()}-${gambar.name}`;
    const { error: uploadError } = await supabase.storage.from("aset_cerita").upload(filePath, gambar, {
      upsert: true,
    });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("aset_cerita").getPublicUrl(filePath);
    gambarUrl = data.publicUrl;
  }

  // Step 3: Update cerita with full data
  const { error: updateError } = await supabase
    .from("cerita")
    .update({
      judul,
      informasi,
      gambar: gambarUrl ?? undefined,
      status,
      terakhir_edit: new Date().toISOString(),
    })
    .eq("cerita_id", newCeritaId);

  if (updateError) throw updateError;

  // Step 4: Handle tags
  // Remove old relations
  await supabase.from("cerita_tag").delete().eq("cerita_id", newCeritaId);

  // Insert new tags
  for (const tagName of tags) {
    let tagId: number;

    const { data: existingTag, error: tagError } = await supabase
      .from("tag")
      .select("tag_id")
      .eq("nama_tag", tagName)
      .maybeSingle();

    if (tagError) throw tagError;

    if (existingTag) {
      tagId = existingTag.tag_id;
    } else {
      const { data: newTag, error: insertTagError } = await supabase
        .from("tag")
        .insert([{ nama_tag: tagName }])
        .select("tag_id")
        .maybeSingle();
      if (insertTagError) throw insertTagError;
      if (!newTag) throw new Error("Failed to insert new tag");
      tagId = newTag.tag_id;
    }

    const { error: relError } = await supabase
      .from("cerita_tag")
      .insert([{ cerita_id: newCeritaId, tag_id: tagId }]);
    if (relError) throw relError;
  }

  return newCeritaId;
}