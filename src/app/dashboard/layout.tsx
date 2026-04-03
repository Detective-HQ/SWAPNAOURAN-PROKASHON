import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { ShoppingBag, FileText, User, LayoutDashboard, History, Leaf } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Explore Shop', href: '/shop' },
    { icon: FileText, label: 'My Ebooks', href: '/ebooks' },
    { icon: History, label: 'Order History', href: '/dashboard/orders' },
    { icon: User, label: 'My Profile', href: '/dashboard/profile' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-grow flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-80 bg-white border-r border-border/40 p-8 space-y-12">
          <div className="space-y-4">
            <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-botanical-sage">Your Sanctuary</h2>
            <div className="h-px bg-border" />
          </div>
          
          <nav className="space-y-4">
            {menuItems.map((item) => (
              <Link 
                key={item.label}
                href={item.href}
                className="flex items-center gap-6 px-6 py-4 rounded-full font-semibold uppercase tracking-widest text-[11px] text-botanical-forest/60 hover:text-botanical-forest hover:bg-botanical-clay/20 transition-all group"
              >
                <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="pt-12 mt-auto">
            <div className="bg-botanical-forest p-8 rounded-[32px] text-botanical-alabaster space-y-4 relative overflow-hidden">
              <Leaf className="absolute -bottom-4 -right-4 w-24 h-24 text-white/5 rotate-45" />
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Collector Status</p>
              <p className="text-xl font-headline font-bold text-botanical-terracotta">Level 02 Bloom</p>
              <div className="w-full h-1 bg-white/10 rounded-full mt-4">
                <div className="w-2/3 h-full bg-botanical-terracotta rounded-full" />
              </div>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-grow p-8 lg:p-16">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
