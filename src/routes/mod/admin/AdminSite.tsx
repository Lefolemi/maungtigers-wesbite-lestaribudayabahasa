import { useState } from "react";

export default function AdminSite() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const handleToggleMaintenance = () => {
    setMaintenanceMode((prev) => !prev);
    // TODO: Save to Supabase "site_settings" table
    console.log("[AdminSite] Maintenance mode:", !maintenanceMode);
  };

  const handleSaveAnnouncement = () => {
    // TODO: Save announcement to Supabase "site_settings" table
    console.log("[AdminSite] Announcement saved:", announcement);
    alert("Announcement saved!");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Site Management</h2>

      {/* Maintenance Mode */}
      <div className="p-4 border rounded-md shadow-sm bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">Maintenance Mode</h3>
        <p className="mb-3 text-sm text-gray-600">
          When enabled, the site will show a maintenance notice to normal users.
        </p>
        <button
          onClick={handleToggleMaintenance}
          className={`px-4 py-2 rounded-md text-white ${
            maintenanceMode ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {maintenanceMode ? "Disable Maintenance" : "Enable Maintenance"}
        </button>
      </div>

      {/* Announcement */}
      <div className="p-4 border rounded-md shadow-sm bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">Site-wide Announcement</h3>
        <textarea
          className="w-full border rounded-md p-2 mb-3"
          rows={4}
          value={announcement}
          onChange={(e) => setAnnouncement(e.target.value)}
          placeholder="Enter announcement text..."
        />
        <button
          onClick={handleSaveAnnouncement}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
        >
          Save Announcement
        </button>
      </div>
    </div>
  );
}