'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, UserButton } from '@clerk/nextjs';
import { useAuth } from '@/context/auth-context';
import { CartDrawer } from '@/components/shop/cart-drawer';
import {
  ShoppingBag,
  FileText,
  User,
  Camera,
  ShoppingCart,
  Leaf,
  Shield,
  Heart,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoaded } = useUser();
  const { user: appUser } = useAuth();

  const menuItems = [
    { icon: ShoppingBag, label: 'Shop', href: '/dashboard/shop' },
    { icon: FileText, label: 'Ebooks', href: '/dashboard/ebooks' },
    { icon: Camera, label: 'Photo Time', href: '/dashboard/photo-time' },
    { icon: ShoppingCart, label: 'My Orders', href: '/dashboard/orders' },
    { icon: Heart, label: 'Wishlist', href: '/dashboard/wishlist' },
    { icon: RotateCcw, label: 'Returns', href: '/dashboard/returns' },
    { icon: User, label: 'Profile', href: '/dashboard/profile' },
  ];

  return (
    <div 
      className="flex min-h-screen bg-background overflow-x-hidden md:h-screen md:overflow-hidden"
      style={{ 
        backgroundImage: "url('/dashboard-logo.png')", 
        backgroundSize: "cover", 
        backgroundPosition: "center", 
        backgroundAttachment: "fixed" 
      }}
    >
      <div className="flex min-w-0 flex-grow flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="sticky top-0 z-50 h-auto w-full flex-shrink-0 space-y-3 overflow-hidden border-b border-border/40 bg-white p-3 md:h-screen md:w-72 md:space-y-10 md:overflow-y-auto md:border-b-0 md:border-r md:p-6">
          <div className="space-y-4">
            <h2 className="px-2 text-[10px] font-bold uppercase tracking-[0.3em] text-botanical-sage md:px-4">SWAPNAOURAN PROKASHON</h2>
            <div className="mx-2 h-px bg-border/50 md:mx-4" />
          </div>

          <nav className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide md:block md:space-y-1 md:overflow-visible md:pb-0">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "group flex shrink-0 items-center gap-2 rounded-lg px-3 py-3 text-[10px] font-semibold uppercase tracking-widest transition-all md:gap-4 md:px-4",
                    isActive
                      ? "text-botanical-forest bg-botanical-clay/30"
                      : "text-botanical-forest/50 hover:text-botanical-forest hover:bg-botanical-clay/10"
                  )}
                >
                  <item.icon className={cn(
                    "w-4 h-4 transition-transform group-hover:scale-110",
                    isActive ? "text-botanical-terracotta" : "text-botanical-sage"
                  )} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {appUser?.role === 'ADMIN' && (
            <div className="pt-6">
              <div className="h-px bg-border/50 mx-4 mb-4" />
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-lg font-semibold uppercase tracking-widest text-[10px] transition-all group",
                  pathname.startsWith('/admin')
                    ? "text-botanical-terracotta bg-botanical-terracotta/10"
                    : "text-botanical-forest/50 hover:text-botanical-terracotta hover:bg-botanical-terracotta/5"
                )}
              >
                <Shield className={cn(
                  "w-4 h-4 transition-transform group-hover:scale-110",
                  pathname.startsWith('/admin') ? "text-botanical-terracotta" : "text-botanical-sage"
                )} />
                Admin
              </Link>
            </div>
          )}

          <div className="mt-auto hidden pt-10 md:block">
            <div className="bg-botanical-forest p-6 rounded-xl text-botanical-alabaster space-y-4 relative overflow-hidden">
              <Leaf className="absolute -bottom-2 -right-2 w-16 h-16 text-white/5 rotate-45" />
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">Reader Status</p>
              <p className="text-lg font-headline font-bold text-botanical-clay">Devoted Reader</p>
              <div className="w-full h-1 bg-white/10 rounded-full">
                <div className="w-3/4 h-full bg-botanical-terracotta rounded-full" />
              </div>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-grow overflow-visible md:overflow-y-auto">
          <div className="z-40 flex items-center justify-end gap-3 border-b border-border/40 bg-white/80 px-4 py-3 backdrop-blur-sm md:sticky md:top-0 md:px-6 lg:px-12">
            {isLoaded && (
              <>
                <CartDrawer />
                <UserButton afterSignOutUrl="/" />
              </>
            )}
          </div>
          <div className="p-4 sm:p-6 lg:p-12">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
