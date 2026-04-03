import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { ShoppingBag, FileText, User, LayoutDashboard, History } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Shop', href: '/shop' },
    { icon: FileText, label: 'Ebooks', href: '/ebooks' },
    { icon: History, label: 'My Orders', href: '/dashboard/orders' },
    { icon: User, label: 'Profile', href: '/dashboard/profile' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 border-r-4 border-black bg-white flex flex-col">
          <div className="p-8 border-b-4 border-black">
            <h2 className="text-2xl font-black tracking-tighter">DASHBOARD</h2>
          </div>
          <nav className="flex-grow">
            {menuItems.map((item) => (
              <Link 
                key={item.label}
                href={item.href}
                className="flex items-center gap-4 px-8 py-6 border-b-2 border-black font-black uppercase tracking-widest text-sm hover:bg-[#F0C020] transition-colors"
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="p-8 mt-auto border-t-4 border-black bg-[#121212] text-white">
            <p className="text-xs font-black uppercase tracking-widest mb-2 opacity-60">Status</p>
            <p className="text-sm font-black text-[#F0C020]">COLLECTOR LEVEL</p>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-grow p-8 lg:p-16 bg-[#F0F0F0]">
          {children}
        </main>
      </div>
    </div>
  );
}
