import { supabase } from "../../backend/supabase";

export async function uploadGambar(file: File, folder: string, artikelId?: number) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

  // If artikelId exists, put it under its folder
  const filePath = artikelId 
    ? `${folder}/${artikelId}/${fileName}`
    : `${folder}/${fileName}`;

  const { data, error } = await supabase.storage
    .from("aset_artikel")
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (error) throw error;

  const { data: urlData } = supabase.storage.from("aset_artikel").getPublicUrl(filePath);
  return urlData.publicUrl;
}