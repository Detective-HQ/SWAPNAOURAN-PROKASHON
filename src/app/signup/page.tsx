import Link from 'next/link';
import { BauhausButton, GeometricShape } from '@/components/bauhaus/bauhaus-primitives';
import { BauhausCard } from '@/components/bauhaus/bauhaus-card';
import { Navbar } from '@/components/layout/navbar';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F0F0F0]">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-lg relative">
          <div className="absolute top-0 right-0 p-8">
             <GeometricShape type="square" color="yellow" className="w-16 h-16 rotate-12" />
          </div>
          
          <BauhausCard decorationColor="red" decorationShape="circle" className="p-8 lg:p-12">
            <h1 className="text-4xl font-black mb-8">JOIN THE<br /><span className="text-[#1040C0]">COLLECTIVE</span></h1>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest mb-2">First Name</label>
                  <input type="text" className="w-full p-4 border-4 border-black font-bold focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest mb-2">Last Name</label>
                  <input type="text" className="w-full p-4 border-4 border-black font-bold focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-2">Email Address</label>
                <input type="email" className="w-full p-4 border-4 border-black font-bold focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-2">Password</label>
                <input type="password" placeholder="Min 8 characters" className="w-full p-4 border-4 border-black font-bold focus:outline-none" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" className="w-6 h-6 border-4 border-black rounded-none checked:bg-[#D02020]" />
                <span className="text-xs font-bold uppercase tracking-widest">I agree to the terms of the manifest</span>
              </div>
              <BauhausButton variant="red" className="w-full" size="lg">START READING</BauhausButton>
            </form>
            <div className="mt-8 text-center border-t-2 border-black pt-6">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Already registered? <Link href="/login" className="text-[#D02020] underline hover:text-black">SIGN IN</Link>
              </p>
            </div>
          </BauhausCard>
        </div>
      </main>
    </div>
  );
}
