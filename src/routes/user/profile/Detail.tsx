import { useEffect, useState } from "react";
import { useUserSession } from "../../../backend/context/UserSessionContext";
import { supabase } from "../../../backend/supabase";
import CropImage from "../../../components/utilities/CropImage";

export default function DetailProfile() {
  const { user } = useUserSession();
  const [username, setUsername] = useState("");
  const [nama, setNama] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [originalProfile, setOriginalProfile] = useState<any>(null); // keep original for comparison
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username ?? "");
      setNama(user.nama ?? "");
      setProfilePic(user.profile_pic ?? null);
      setOriginalProfile({
        username: user.username ?? "",
        nama: user.nama ?? "",
        profile_pic: user.profile_pic ?? null,
      });
    }
  }, [user]);

  // upload base64 cropped image → Supabase Storage → return public URL
  const uploadProfilePic = async (base64Image: string): Promise<string> => {
    if (!user) throw new Error("Not logged in");

    const fileName = `profile_${Date.now()}.png`;
    const filePath = `${user.id}/${fileName}`; // <- put inside folder by user id

    // convert base64 → File
    const res = await fetch(base64Image);
    const blob = await res.blob();

    // no upsert: true here, safer with RLS
    const { error: uploadError } = await supabase.storage
      .from("profile_pic")
      .upload(filePath, blob, { contentType: "image/png" });

    if (uploadError) throw uploadError;

    // get public URL
    const { data } = supabase.storage.from("profile_pic").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    setMessage(null);
  
    try {
      let profilePicUrl = profilePic;
  
      // If profilePic is base64 (newly cropped), upload first
      if (profilePic && profilePic.startsWith("data:image")) {
        profilePicUrl = await uploadProfilePic(profilePic);
      }
  
      // Build payload with only changed values
      const payload: Record<string, any> = {};
      if (username !== originalProfile.username) payload.username = username;
      if (nama !== originalProfile.nama) payload.nama = nama;
      if (profilePicUrl !== originalProfile.profile_pic)
        payload.profile_pic = profilePicUrl;
  
      // If nothing changed, skip update
      if (Object.keys(payload).length === 0) {
        setMessage("Tidak ada perubahan untuk disimpan.");
        setLoading(false);
        return;
      }
  
      // Update only what changed
      const { data, error } = await supabase
        .from("user")
        .update(payload)
        .eq("auth_id", user.id)
        .select(); // <-- will return the updated row if SELECT policy exists
  
      if (error) throw error;
  
      const updated = data?.[0];
      setMessage("Perubahan tersimpan.");
      setOriginalProfile({
        username: updated.username,
        nama: updated.nama,
        profile_pic: updated.profile_pic,
      });
      setProfilePic(updated.profile_pic);
    } catch (err: any) {
      console.error(err);
      setMessage("Gagal menyimpan: " + (err.message ?? err));
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Pengaturan Akun</h1>

      {/* Profile picture */}
      <div className="flex flex-col items-center space-y-2">
        {profilePic ? (
          <img
            src={profilePic}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border"
          />
        ) : (
          <div className="text-sm text-gray-500">Belum ada foto profil</div>
        )}

        <CropImage
          onComplete={(cropped) => {
            setProfilePic(cropped); // base64 for now
            setMessage("Foto telah dipilih (belum disimpan). Tekan Simpan.");
          }}
          onCancel={() => setMessage("Dibatalkan.")}
        />

        {profilePic && (
          <button
            onClick={() => setProfilePic(null)}
            className="px-3 py-1 text-sm rounded bg-gray-200"
          >
            Hapus
          </button>
        )}
      </div>

      {/* Username */}
      <div>
        <label className="block text-sm font-medium mb-1">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mt-1 p-2 border rounded"
        />
      </div>

      {/* Nama */}
      <div>
        <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          className="w-full mt-1 p-2 border rounded"
        />
      </div>

      {/* Email (disabled) */}
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          disabled
          value={user.email ?? ""}
          className="w-full px-3 py-2 border rounded bg-gray-100"
        />
      </div>

      {message && <p className="text-sm text-gray-700">{message}</p>}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
}