'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { 
  ShoppingBag, 
  FileText, 
  User, 
  LayoutDashboard, 
  Camera, 
  ShoppingCart,
  Home,
  Leaf
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const menuItems = [
    { icon: Home, label: 'Home', href: '/dashboard' },
    { icon: ShoppingBag, label: 'Shop', href: '/dashboard/shop' },
    { icon: FileText, label: 'Ebooks', href: '/dashboard/ebooks' },
    { icon: Camera, label: 'Photo Time', href: '/dashboard/photo-time' },
    { icon: ShoppingCart, label: 'My Orders', href: '/dashboard/orders' },
    { icon: User, label: 'Profile', href: '/dashboard/profile' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-grow flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-72 bg-white border-r border-border/40 p-6 space-y-10 flex-shrink-0">
          <div className="space-y-4">
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-botanical-sage px-4">Sanctuary Menu</h2>
            <div className="h-px bg-border/50 mx-4" />
          </div>
          
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-2xl font-semibold uppercase tracking-widest text-[10px] transition-all group",
                    isActive 
                      ? "text-botanical-forest bg-botanical-clay/30" 
                      : "text-botanical-forest/50 hover:text-botanical-forest hover:bg-botanical-clay/10"
                  )}
                >
                  <item.icon className={cn(
                    "w-4 h-4 transition-transform group-hover:scale-110",
                    isActive ? "text-botanical-terracotta" : "text-botanical-sage"
                  )} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-10 mt-auto">
            <div className="bg-botanical-forest p-6 rounded-[32px] text-botanical-alabaster space-y-4 relative overflow-hidden">
              <Leaf className="absolute -bottom-2 -right-2 w-16 h-16 text-white/5 rotate-45" />
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">Reader Status</p>
              <p className="text-lg font-headline font-bold text-botanical-clay">Elite Bloom</p>
              <div className="w-full h-1 bg-white/10 rounded-full">
                <div className="w-3/4 h-full bg-botanical-terracotta rounded-full" />
              </div>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-grow p-6 lg:p-12 overflow-x-hidden">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
