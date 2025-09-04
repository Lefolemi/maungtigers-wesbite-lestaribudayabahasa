import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen font-sans overflow-x-hidden">
      <Navbar />
      <main className="flex-grow">
        <Outlet /> {/* React Router will render nested route here */}
      </main>
      <Footer />
    </div>
  );
}