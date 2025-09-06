// src/components/makna-kata/simpanMaknaKata.ts
import { supabase } from "../../backend/supabase";

type SimpanMaknaParams = {
  maknaId?: number | null; // actual PK for edit
  userId: number;
  kataId: number; // FK to selected word
  bahasaId: number;
  arti: any; // TipTap JSON
  informasi: string;
  etimologi?: any; // TipTap JSON
  gambar?: File | null;
  tags: string[];
  status: "draft" | "direview" | "terbit";
};

export async function simpanMaknaKata({
  maknaId = null,
  userId,
  kataId,
  bahasaId,
  arti,
  informasi,
  etimologi,
  gambar,
  tags,
  status,
}: SimpanMaknaParams): Promise<number> {
  let newMaknaId: number;

  // Step 1: Insert shell if new
  if (!maknaId) {
    const { data, error } = await supabase
      .from("makna_kata")
      .insert([
        {
          kata_id: kataId,
          bahasa_id: bahasaId,
          user_id: userId,
          arti,
          informasi: "",
          etimologi: null,
          gambar: null,
          status,
          terakhir_edit: new Date().toISOString(),
        },
      ])
      .select("makna_id")
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Failed to create makna_kata shell");

    newMaknaId = data.makna_id;
  } else {
    newMaknaId = maknaId;
  }

  // Step 2: Upload gambar (if any)
  let gambarUrl: string | null = null;
  if (gambar instanceof File) {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(gambar.type)) throw new Error("Format gambar tidak didukung");
    if (gambar.size > 5 * 1024 * 1024) throw new Error("Ukuran gambar terlalu besar");

    const filePath = `makna_kata/${newMaknaId}/${Date.now()}-${gambar.name}`;
    const { error: uploadError } = await supabase.storage.from("aset_makna_kata").upload(filePath, gambar, {
      upsert: true,
    });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("aset_makna_kata").getPublicUrl(filePath);
    gambarUrl = data.publicUrl;
  }

  // Step 3: Update makna_kata with full data
  const { error: updateError } = await supabase
    .from("makna_kata")
    .update({
      arti,
      informasi,
      etimologi: etimologi ?? null,
      gambar: gambarUrl ?? undefined,
      status,
      terakhir_edit: new Date().toISOString(),
    })
    .eq("makna_id", newMaknaId);

  if (updateError) throw updateError;

  // Step 4: Handle tags
  await supabase.from("makna_kata_tag").delete().eq("makna_id", newMaknaId);

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
      .from("makna_kata_tag")
      .insert([{ makna_id: newMaknaId, tag_id: tagId }]);
    if (relError) throw relError;
  }

  return newMaknaId;
}