// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Layout from './components/fixed/Layout';

import Beranda from './routes/Beranda';
import TentangWebsite from './routes/about/TentangWebsite';
import Timeline from './routes/about/Timeline';
import Kamus from './routes/kontribusi/Kamus';
import Cerita from './routes/kontribusi/Cerita';
import MaknaKata from './routes/kontribusi/MaknaKata';
import Artikel from './routes/artikel/Artikel';
import ArtikelDetail from './routes/artikel/ArtikelDetail';
import Register from './routes/user/Register';
import Login from './routes/user/Login';
import TakDitemukan from './routes/TakDitemukan';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={ <Layout> <Beranda /> </Layout> } />
        <Route path="/tentang-website" element={<Layout><TentangWebsite /></Layout>} />
        <Route path="/timeline" element={<Layout><Timeline /></Layout>} />
        <Route path="/kamus" element={<Layout><Kamus /></Layout>} />
        <Route path="/cerita" element={<Layout><Cerita /></Layout>} />
        <Route path="/makna-kata" element={<Layout><MaknaKata /></Layout>} />
        <Route path="/artikel" element={<Layout><Artikel /></Layout>} />
        <Route path="/artikel/:slug" element={<ArtikelDetail />} />
        <Route path="/register" element={<Layout><Register /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="*" element={<TakDitemukan />} />
      </Routes>
    </BrowserRouter>
  );
}