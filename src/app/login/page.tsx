'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BauhausButton, GeometricShape } from '@/components/bauhaus/bauhaus-primitives';
import { BauhausCard } from '@/components/bauhaus/bauhaus-card';
import { Navbar } from '@/components/layout/navbar';
import { useAuth, useUser, initiateAnonymousSignIn } from '@/firebase';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { auth } = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleDemoLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (auth) {
      initiateAnonymousSignIn(auth);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md relative">
          <div className="absolute -top-16 -left-16 opacity-20 hidden md:block">
            <GeometricShape type="circle" color="sage" className="w-48 h-48" />
          </div>
          <div className="absolute -bottom-16 -right-16 opacity-20 hidden md:block">
            <GeometricShape type="arch" color="clay" className="w-48 h-64 rotate-12" />
          </div>
          
          <BauhausCard className="p-10 lg:p-16 border border-border/40">
            <div className="text-center space-y-4 mb-12">
              <h1 className="text-4xl font-headline font-bold text-botanical-forest italic">Welcome Back</h1>
              <p className="text-xs uppercase tracking-[0.3em] font-bold text-botanical-sage">Enter your sanctuary</p>
            </div>

            <form className="space-y-8" onSubmit={handleDemoLogin}>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-botanical-forest/60 ml-4">Email Address</label>
                <input 
                  type="email" 
                  disabled
                  className="w-full px-8 py-4 rounded-full bg-botanical-clay/10 border border-border focus:outline-none focus:ring-2 focus:ring-botanical-sage/30 transition-all font-medium placeholder:opacity-30"
                  placeholder="demo@swapnouran.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-botanical-forest/60 ml-4">Password</label>
                <input 
                  type="password" 
                  disabled
                  className="w-full px-8 py-4 rounded-full bg-botanical-clay/10 border border-border focus:outline-none focus:ring-2 focus:ring-botanical-sage/30 transition-all font-medium placeholder:opacity-30"
                  placeholder="••••••••"
                />
              </div>
              
              <div className="space-y-4">
                <BauhausButton type="submit" variant="primary" className="w-full" size="lg" disabled={isUserLoading}>
                  {isUserLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'SIGN IN'}
                </BauhausButton>
                
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/60"></div></div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold"><span className="bg-white px-4 text-botanical-sage">or</span></div>
                </div>

                <BauhausButton 
                  onClick={handleDemoLogin}
                  type="button" 
                  variant="terracotta" 
                  className="w-full" 
                  size="lg"
                  disabled={isUserLoading}
                >
                  TRY DEMO ACCESS
                </BauhausButton>
              </div>
            </form>

            <div className="mt-12 text-center">
              <p className="text-xs font-bold text-botanical-forest/50 uppercase tracking-widest">
                New reader? <Link href="/signup" className="text-botanical-terracotta hover:underline">Create Account</Link>
              </p>
            </div>
          </BauhausCard>
        </div>
      </main>
    </div>
  );
}
