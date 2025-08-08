import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen font-sans">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
        </div>
    );
}