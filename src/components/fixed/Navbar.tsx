import { Link } from 'react-router-dom';
import { useState } from 'react';

type NavItem = {
    label: string;
    path?: string;
    children?: { label: string; path: string }[];
};

const navItems: NavItem[] = [
    { label: 'Beranda', path: '/' },
    {
        label: 'Tentang',
        children: [
            { label: 'Tentang Website', path: '/tentang-website' },
            { label: 'Timeline', path: '/timeline' },
        ],
    },
    {
        label: 'Kontribusi',
        children: [
            { label: 'Kamus', path: '/kamus' },
            { label: 'Cerita', path: '/cerita' },
            { label: 'Makna Kata', path: '/makna-kata' },
        ],
    },
    { label: 'Artikel', path: '/artikel' },
];

export default function Navbar() {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    return (
        <nav className="bg-blue-600 text-white px-4 py-3 shadow-md">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Left: nav links */}
            <div className="flex items-center space-x-6">
                {navItems.map((item) =>
                item.children ? (
                    <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(item.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                    >
                    <button className="hover:underline">{item.label}</button>
                    {openDropdown === item.label && (
                        <div className="absolute left-0 mt-2 bg-white text-black rounded shadow-md z-10 min-w-max">
                        {item.children.map((child) => (
                            <Link
                            key={child.path}
                            to={child.path}
                            className="block px-4 py-2 hover:bg-gray-100"
                            >
                            {child.label}
                            </Link>
                        ))}
                        </div>
                    )}
                    </div>
                ) : (
                    <Link
                    key={item.path}
                    to={item.path!}
                    className="hover:underline"
                    >
                    {item.label}
                    </Link>
                )
                )}
            </div>

            {/* Right: Auth */}
            <div className="space-x-4">
                <Link to="/register" className="hover:underline">
                Register
                </Link>
                <Link to="/login" className="hover:underline">
                Login
                </Link>
            </div>
            </div>
        </nav>
    );
}