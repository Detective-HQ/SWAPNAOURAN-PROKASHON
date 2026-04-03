import Link from 'next/link';
import { GeometricShape, BauhausButton } from '@/components/bauhaus/bauhaus-primitives';
import { CartDrawer } from '@/components/shop/cart-drawer';
import { Menu } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="border-b-4 border-[#121212] bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 group">
          <div className="flex -space-x-3">
            <GeometricShape type="circle" color="red" className="w-6 h-6 md:w-8 md:h-8 border-2 border-black" />
            <GeometricShape type="square" color="yellow" className="w-6 h-6 md:w-8 md:h-8 border-2 border-black rotate-45" />
            <GeometricShape type="triangle" color="blue" className="w-6 h-6 md:w-8 md:h-8 scale-75" />
          </div>
          <span className="font-black text-xl md:text-2xl tracking-tighter hidden sm:block">SWAPNO URAN</span>
        </Link>

        <div className="hidden lg:flex items-center gap-8 font-bold uppercase tracking-widest text-xs">
          <Link href="/" className="hover:text-[#D02020] transition-colors">Home</Link>
          <Link href="/shop" className="hover:text-[#1040C0] transition-colors">Shop</Link>
          <Link href="/ebooks" className="hover:text-[#F0C020] transition-colors">Ebooks</Link>
          <Link href="/photo-time" className="hover:text-[#D02020] transition-colors">Photo Time</Link>
          <Link href="/dashboard" className="hover:text-[#1040C0] transition-colors">Dashboard</Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <Link href="/login">
              <BauhausButton variant="outline" size="sm">Sign In</BauhausButton>
            </Link>
            <Link href="/signup">
              <BauhausButton variant="black" size="sm" className="hidden md:inline-flex">Sign Up</BauhausButton>
            </Link>
          </div>
          <CartDrawer />
          <button className="lg:hidden p-2 border-4 border-black">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}
