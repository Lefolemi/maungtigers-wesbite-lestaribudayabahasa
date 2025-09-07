import { useNavigate } from "react-router-dom";

type NavbarProps = {
  title: string;
  backTo?: string;
};

export default function NavbarBarebone({ title, backTo }: NavbarProps) {
  const navigate = useNavigate();

  return (
    <nav className="w-full bg-sekunder shadow px-4 py-3 flex items-center">
      {/* Back button */}
      <button
        onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
        className="text-white font-medium"
      >
        ← Kembali
      </button>

      {/* Title */}
      <div className="flex-1 text-white text-center font-bold text-lg">{title}</div>

      {/* Spacer (right side empty) */}
      <div className="w-20" />
    </nav>
  );
}