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
  LayoutDashboard, 
  Camera, 
  ShoppingCart,
  Home,
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
    { icon: Home, label: 'Home', href: '/dashboard' },
    { icon: ShoppingBag, label: 'Shop', href: '/dashboard/shop' },
    { icon: FileText, label: 'Ebooks', href: '/dashboard/ebooks' },
    { icon: Camera, label: 'Photo Time', href: '/dashboard/photo-time' },
    { icon: ShoppingCart, label: 'My Orders', href: '/dashboard/orders' },
    { icon: Heart, label: 'Wishlist', href: '/dashboard/wishlist' },
    { icon: RotateCcw, label: 'Returns', href: '/dashboard/returns' },
    { icon: User, label: 'Profile', href: '/dashboard/profile' },
  ];

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <div className="flex-grow flex flex-row">
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-border/40 p-6 space-y-10 flex-shrink-0 h-screen overflow-y-auto sticky top-0">
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

          {appUser?.role === 'ADMIN' && (
            <div className="pt-6">
              <div className="h-px bg-border/50 mx-4 mb-4" />
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-2xl font-semibold uppercase tracking-widest text-[10px] transition-all group",
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
        <main className="flex-grow overflow-y-auto">
          <div className="flex items-center justify-end gap-3 px-6 lg:px-12 py-4 border-b border-border/40 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
            {isLoaded && (
              <>
                <CartDrawer />
                <UserButton afterSignOutUrl="/" />
              </>
            )}
          </div>
          <div className="p-6 lg:p-12">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
