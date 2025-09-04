// src/App.tsx
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { UserSessionProvider } from "./backend/context/UserSessionContext";
import { UserPerizinanProvider } from "./backend/context/UserPerizinanContext";

import ProtectedRoute from "./backend/blocked/ProtectedRoute";
import RoleRoute from "./backend/blocked/RoleRoute"; // ⬅️ import RoleRoute

import Layout from "./components/fixed/Layout";

import Beranda from "./routes/Beranda";
import TentangWebsite from "./routes/about/TentangWebsite";
import Timeline from "./routes/about/Timeline";
import Intro from "./routes/about/Intro";

import Kamus from "./routes/kamus/Kamus";
import BuatKamus from "./routes/kamus/BuatKamus";
import EditKamus from "./routes/kamus/EditKamus";

import Cerita from "./routes/cerita/Cerita";
import MaknaKata from "./routes/makna_kata/MaknaKata";

import Artikel from "./routes/artikel/Artikel";
import ArtikelDetail from "./routes/artikel/ArtikelDetail";
import BuatArtikel from "./routes/artikel/BuatArtikel";
import EditArtikel from "./routes/artikel/EditArtikel";
import PreviewArtikel from "./routes/artikel/ArtikelPreview";

import Register from "./routes/user/Register";
import Login from "./routes/user/Login";

import Profile from "./routes/user/profile/Profile";
import Dashboard from "./routes/user/dashboard/Dashboard";
import KontribusiView from "./routes/user/kontribusiview/KontribusiView";

import TakDitemukan from "./routes/TakDitemukan";

import TestFetchArtikel from "./routes/artikel/TestFetchArtikel";

// ⬅️ new pages
import AdminPage from "./routes/mod/admin/Admin";
import ModeratorPage from "./routes/mod/moderator/Moderator";

const router = createBrowserRouter([
  {
    element: <Layout />, // Shared layout wrapper
    children: [
      { path: "/", element: <Beranda /> },
      { path: "/tentang-website", element: <TentangWebsite /> },
      { path: "/timeline", element: <Timeline /> },
      { path: "/intro", element: <Intro /> },

      { path: "/kamus", element: <Kamus /> },

      { path: "/cerita", element: <Cerita /> },

      { path: "/makna-kata", element: <MaknaKata /> },

      { path: "/artikel", element: <Artikel /> },
      { path: "/artikel/:slug", element: <ArtikelDetail /> },

      { path: "/register", element: <Register /> },
      { path: "/login", element: <Login /> },
    ],
  },

  // Routes outside Layout
  {
    path: "/kamus/buat",
    element: (
      <ProtectedRoute tipeKonten="kamus" action="buat">
        <BuatKamus />
      </ProtectedRoute>
    ),
  },
  {
    path: "/kamus/edit",
    element: (
      <ProtectedRoute tipeKonten="kamus" action="edit">
        <EditKamus />
      </ProtectedRoute>
    ),
  },

  {
    path: "/artikel/buat",
    element: (
      <ProtectedRoute tipeKonten="artikel" action="buat">
        <BuatArtikel />
      </ProtectedRoute>
    ),
  },
  {
    path: "/artikel/edit/:slug",
    element: (
      <ProtectedRoute tipeKonten="artikel" action="edit">
        <EditArtikel />
      </ProtectedRoute>
    ),
  },
  { path: "/artikel/preview", element: <PreviewArtikel /> },
  { path: "/test-fetch", element: <TestFetchArtikel /> },

  { path: "/profile/:tab?", element: <Profile /> },
  { path: "/dashboard/:tab?", element: <Dashboard /> },
  { path: "/lihat-kontribusi/:tab?", element: <KontribusiView /> },

   // Admin & Moderator (hidden if not allowed)
   {
    path: "/admin-zone/:tab?",
    element: (
      <RoleRoute allowedRoles={["admin"]} notFoundMode>
        <AdminPage />
      </RoleRoute>
    ),
  },
  {
    path: "/moderator-zone/:tab?",
    element: (
      <RoleRoute allowedRoles={["moderator", "admin"]} notFoundMode>
        <ModeratorPage />
      </RoleRoute>
    ),
  },

  // Missing path
  { path: "*", element: <TakDitemukan /> },
]);

export default function App() {
  return (
    <UserSessionProvider>
      <UserPerizinanProvider>
        <RouterProvider router={router} />
      </UserPerizinanProvider>
    </UserSessionProvider>
  );
}