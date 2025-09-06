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
import CeritaDetail from "./routes/cerita/CeritaDetail";
import BuatCerita from "./routes/cerita/BuatCerita";
import CeritaPreview from "./routes/cerita/CeritaPreview";
import EditCerita from "./routes/cerita/EditCerita";

import MaknaKata from "./routes/makna_kata/MaknaKata";
import MaknaKataDetail from "./routes/makna_kata/MaknaKataDetail";
import BuatMakna from "./routes/makna_kata/BuatMakna";
import EditMakna from "./routes/makna_kata/EditMakna";
import MaknaKataPreview from "./routes/makna_kata/MaknaKataPreview";

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
import ReviewArtikelLihat from "./routes/mod/moderator/lihatreview/ReviewArtikelLihat";
import ReviewCeritaLihat from "./routes/mod/moderator/lihatreview/ReviewCeritaLihat";
import ReviewMaknaKataLihat from "./routes/mod/moderator/lihatreview/ReviewMaknaKataLihat";

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
      { path: "/cerita/:id", element: <CeritaDetail /> },

      { path: "/makna-kata", element: <MaknaKata /> },
      { path: "/makna-kata/:id", element: <MaknaKataDetail /> },

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

  { path: "/cerita/buat", element: <BuatCerita /> },
  { path: "/cerita/edit/:id", element: <EditCerita /> },
  { path: "/cerita/preview", element: <CeritaPreview /> },

  { path: "/makna-kata/buat", element: <BuatMakna /> },
  { path: "/makna-kata/edit/:id", element: <EditMakna /> },
  { path: "/makna-kata/preview", element: <MaknaKataPreview /> },

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

  { path: "/moderator-zone/review/lihat/artikel/:slug", element: <ReviewArtikelLihat /> },
  { path: "/moderator-zone/review/lihat/cerita/:id", element: <ReviewCeritaLihat /> },
  { path: "/moderator-zone/review/lihat/makna-kata/:id", element: <ReviewMaknaKataLihat /> },

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