import { Link } from "react-router-dom";

const dummyArticles = [
  {
    slug: "apa-itu-kata-serapan",
    title: "Apa Itu Kata Serapan?",
  },
  {
    slug: "sejarah-bahasa-indonesia",
    title: "Sejarah Bahasa Indonesia",
  },
];

export default function Artikel() {
  return (
    <div className="p-8">
      <h1 className="text-3xl mb-6">Daftar Artikel</h1>
      <ul className="space-y-2">
        {dummyArticles.map((article) => (
          <li key={article.slug}>
            <Link to={`/artikel/${article.slug}`} className="text-blue-600 hover:underline">
              {article.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}