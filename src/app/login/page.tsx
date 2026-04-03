import Link from 'next/link';
import { BauhausButton, GeometricShape } from '@/components/bauhaus/bauhaus-primitives';
import { BauhausCard } from '@/components/bauhaus/bauhaus-card';
import { Navbar } from '@/components/layout/navbar';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F0F0F0]">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md relative">
          <div className="absolute -top-12 -left-12 opacity-40">
            <GeometricShape type="circle" color="red" className="w-24 h-24" />
          </div>
          <div className="absolute -bottom-12 -right-12 opacity-40">
            <GeometricShape type="triangle" color="blue" className="w-24 h-24 rotate-45" />
          </div>
          
          <BauhausCard decorationColor="yellow" decorationShape="square" className="p-8 lg:p-12">
            <h1 className="text-4xl font-black mb-8 text-center">SIGN IN</h1>
            <form className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-2">Email Address</label>
                <input 
                  type="email" 
                  className="w-full p-4 border-4 border-black font-bold focus:outline-none focus:bg-[#F0C020]/10"
                  placeholder="name@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-2">Password</label>
                <input 
                  type="password" 
                  className="w-full p-4 border-4 border-black font-bold focus:outline-none focus:bg-[#D02020]/10"
                  placeholder="••••••••"
                />
              </div>
              <BauhausButton variant="black" className="w-full" size="lg">LOGIN</BauhausButton>
            </form>
            <div className="mt-8 text-center">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                New reader? <Link href="/signup" className="text-[#1040C0] underline hover:text-black">CREATE ACCOUNT</Link>
              </p>
            </div>
          </BauhausCard>
        </div>
      </main>
    </div>
  );
}
