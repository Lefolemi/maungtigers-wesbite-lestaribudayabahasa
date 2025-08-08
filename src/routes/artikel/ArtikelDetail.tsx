// pages/ArtikelDetail.tsx
import { useParams } from "react-router-dom";

const dummyArticles = [
  {
    slug: "apa-itu-kata-serapan",
    title: "Apa Itu Kata Serapan?",
    content: "Kata serapan adalah kata yang berasal dari bahasa asing dan diadopsi ke dalam bahasa Indonesia...",
  },
  {
    slug: "sejarah-bahasa-indonesia",
    title: "Sejarah Bahasa Indonesia",
    content: "Bahasa Indonesia berkembang dari bahasa Melayu dan menjadi bahasa persatuan sejak Sumpah Pemuda 1928...",
  },
];

export default function ArtikelDetail() {
  const { slug } = useParams<{ slug: string }>();
  const article = dummyArticles.find((a) => a.slug === slug);

  if (!article) {
    return <div className="p-8 text-red-600">Artikel tidak ditemukan.</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      <p className="text-lg">{article.content}</p>
    </div>
  );
}