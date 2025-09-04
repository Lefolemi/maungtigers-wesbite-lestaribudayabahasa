import { supabase } from "../../backend/supabase";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE_MB = 5; // 5 MB

export async function updateGambar(
  file: File,
  folder: string,
  artikelId?: number
) {
  // ✅ Validate type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      `File type not allowed: ${file.type}. Only JPEG, PNG, GIF, and WebP are supported.`
    );
  }

  // ✅ Validate size
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(
      `File is too large: ${(file.size / 1024 / 1024).toFixed(
        2
      )} MB. Max size is ${MAX_SIZE_MB} MB.`
    );
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${fileExt}`;

  const filePath = artikelId
    ? `${folder}/${artikelId}/${fileName}`
    : `${folder}/${fileName}`;

  const { error } = await supabase.storage
    .from("aset_artikel")
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("aset_artikel")
    .getPublicUrl(filePath);

  return {
    path: filePath, // useful for tracking/deleting later
    url: urlData.publicUrl,
  };
}