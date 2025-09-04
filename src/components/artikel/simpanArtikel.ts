// simpanArtikel.ts
import { supabase } from "../../backend/supabase";

async function uploadGambar(
  file: File,
  type: "thumbnail" | "gambar_konten",
  artikelId: number
) {
  // ✅ Allowed file types
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const maxSize = 5 * 1024 * 1024; // 5 MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Format gambar tidak didukung. Gunakan JPEG, PNG, GIF, atau WebP.");
  }
  if (file.size > maxSize) {
    throw new Error("Ukuran gambar terlalu besar. Maksimal 5MB.");
  }

  const folder = type === "thumbnail" ? "thumbnail" : "gambar_konten";
  const filePath = `${folder}/${artikelId}/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("aset_artikel")
    .upload(filePath, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from("aset_artikel").getPublicUrl(filePath);
  return data.publicUrl;
}

async function uploadEmbeddedImages(node: any, artikelId: number): Promise<any> {
  if (Array.isArray(node)) {
    return Promise.all(node.map((child) => uploadEmbeddedImages(child, artikelId)));
  } else if (node && typeof node === "object") {
    if (node.type === "image" && node.attrs?.src?.startsWith("blob:")) {
      const response = await fetch(node.attrs.src);
      const blob = await response.blob();
      const file = new File([blob], "embedded.png", { type: blob.type });

      // ✅ This also goes through the same file-type/size checks
      const url = await uploadGambar(file, "gambar_konten", artikelId);

      return {
        ...node,
        attrs: { ...node.attrs, src: url },
      };
    }
    const newNode: Record<string, any> = {};
    for (const [k, v] of Object.entries(node)) {
      newNode[k] = await uploadEmbeddedImages(v, artikelId);
    }
    return newNode;
  }
  return node;
}

export async function simpanArtikel({
  artikelId,
  title,
  content,
  thumbnail,
  slug,
  tags,
  status,
  userId,
}: {
  artikelId?: number | null;
  title: string;
  content: any;
  thumbnail: File | string | null;
  slug: string;
  tags: string[];
  status: string;
  userId?: number;
}) {
  let newArtikelId: number;

  if (artikelId) {
    newArtikelId = artikelId;
  } else {
    if (!userId) throw new Error("userId is required when creating artikel");

    const { data, error } = await supabase
      .from("artikel")
      .insert([
        {
          user_id: userId,
          judul: title || "(untitled)",
          konten: {}, // placeholder
          thumbnail: null,
          slug,
          status,
          terakhir_edit: new Date().toISOString(),
        },
      ])
      .select("artikel_id")
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Failed to create artikel shell");

    newArtikelId = data.artikel_id;
  }

  // 🖼️ Thumbnail
  let thumbnailUrl: string | null = null;
  if (thumbnail instanceof File) {
    thumbnailUrl = await uploadGambar(thumbnail, "thumbnail", newArtikelId);
  } else if (typeof thumbnail === "string") {
    thumbnailUrl = thumbnail;
  }

  // 🖼️ Embedded images
  const kontenValue = await uploadEmbeddedImages(content, newArtikelId);

  // 🔄 Update artikel with full data
  const { error: artikelError } = await supabase
    .from("artikel")
    .update({
      judul: title,
      konten: kontenValue,
      thumbnail: thumbnailUrl,
      slug,
      status,
      terakhir_edit: new Date().toISOString(),
    })
    .eq("artikel_id", newArtikelId);

  if (artikelError) throw artikelError;

  // 🔖 Handle tags
  let tagIds: number[] = [];
  for (const tagName of tags) {
    const { data: existingTag } = await supabase
      .from("tag")
      .select("tag_id")
      .eq("nama_tag", tagName)
      .maybeSingle();

    if (existingTag) {
      tagIds.push(existingTag.tag_id);
    } else {
      const { data: newTag, error: tagInsertError } = await supabase
        .from("tag")
        .insert([{ nama_tag: tagName }])
        .select("tag_id")
        .maybeSingle();

      if (tagInsertError) throw tagInsertError;
      if (newTag) tagIds.push(newTag.tag_id);
    }
  }

  await supabase.from("artikel_tag").delete().eq("artikel_id", newArtikelId);

  if (tagIds.length > 0) {
    const artikelTagRows = tagIds.map((tagId) => ({
      artikel_id: newArtikelId,
      tag_id: tagId,
    }));
    const { error: artikelTagError } = await supabase
      .from("artikel_tag")
      .insert(artikelTagRows);

    if (artikelTagError) throw artikelTagError;
  }

  return newArtikelId;
}