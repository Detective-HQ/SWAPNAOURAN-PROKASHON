'use client';

import Link from 'next/link';
import { GeometricShape, BauhausButton } from '@/components/bauhaus/bauhaus-primitives';
import { CartDrawer } from '@/components/shop/cart-drawer';
import { Menu, User as UserIcon } from 'lucide-react';
import { useUser } from '@/firebase';

export function Navbar() {
  const { user, isUserLoading } = useUser();

  return (
    <nav className="bg-background/80 backdrop-blur-md sticky top-0 z-50 py-6 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 group">
          <GeometricShape type="square" color="sage" className="w-12 h-12" />
          <span className="font-headline font-bold text-2xl tracking-tight text-botanical-forest italic">Swapno Uran</span>
        </Link>

        {/* Conditionally show internal links only if user is logged in */}
        {user && !isUserLoading && (
          <div className="hidden lg:flex items-center gap-12 font-medium uppercase tracking-[0.2em] text-[11px] text-botanical-forest/70">
            <Link href="/dashboard" className="hover:text-botanical-terracotta transition-colors">Home</Link>
            <Link href="/dashboard/shop" className="hover:text-botanical-terracotta transition-colors">Shop</Link>
            <Link href="/dashboard/ebooks" className="hover:text-botanical-terracotta transition-colors">Ebooks</Link>
            <Link href="/dashboard/photo-time" className="hover:text-botanical-terracotta transition-colors">Photo Time</Link>
            <Link href="/dashboard/orders" className="hover:text-botanical-terracotta transition-colors">My Orders</Link>
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4">
            {!user && !isUserLoading ? (
              <>
                <Link href="/login">
                  <BauhausButton variant="ghost" size="sm">Sign In</BauhausButton>
                </Link>
                <Link href="/signup">
                  <BauhausButton variant="primary" size="sm">Join Collective</BauhausButton>
                </Link>
              </>
            ) : (
              <Link href="/dashboard/profile">
                <BauhausButton variant="ghost" size="sm" className="flex items-center gap-2">
                  <UserIcon size={16} />
                  <span className="hidden md:inline">Profile</span>
                </BauhausButton>
              </Link>
            )}
          </div>
          <CartDrawer />
          <button className="lg:hidden p-3 rounded-full hover:bg-botanical-forest/5 transition-colors">
            <Menu className="w-6 h-6 text-botanical-forest" />
          </button>
        </div>
      </div>
    </nav>
  );
}
