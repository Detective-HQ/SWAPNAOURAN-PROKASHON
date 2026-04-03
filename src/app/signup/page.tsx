'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BauhausButton, GeometricShape } from '@/components/bauhaus/bauhaus-primitives';
import { BauhausCard } from '@/components/bauhaus/bauhaus-card';
import { Navbar } from '@/components/layout/navbar';
import { useAuth, useUser, initiateAnonymousSignIn } from '@/firebase';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
  const { auth } = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleDemoSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (auth) {
      initiateAnonymousSignIn(auth);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-6 lg:p-12 relative">
        <div className="w-full max-w-xl relative">
          <div className="absolute top-0 right-0 p-8 opacity-20">
             <GeometricShape type="square" color="terracotta" className="w-24 h-24 rotate-12" />
          </div>
          
          <BauhausCard className="p-10 lg:p-16 border border-border/40">
            <div className="space-y-4 mb-12 text-center md:text-left">
              <h1 className="text-5xl font-headline font-bold text-botanical-forest leading-tight">Join The <br /><span className="italic font-normal text-botanical-terracotta">Collective</span></h1>
              <p className="text-xs uppercase tracking-[0.3em] font-bold text-botanical-sage">Begin your botanical journey</p>
            </div>

            <form className="space-y-6" onSubmit={handleDemoSignup}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-botanical-forest/60 ml-4">First Name</label>
                  <input type="text" disabled className="w-full px-8 py-4 rounded-full bg-botanical-clay/10 border border-border focus:outline-none focus:ring-2 focus:ring-botanical-sage/30 transition-all font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-botanical-forest/60 ml-4">Last Name</label>
                  <input type="text" disabled className="w-full px-8 py-4 rounded-full bg-botanical-clay/10 border border-border focus:outline-none focus:ring-2 focus:ring-botanical-sage/30 transition-all font-medium" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-botanical-forest/60 ml-4">Email Address</label>
                <input type="email" disabled className="w-full px-8 py-4 rounded-full bg-botanical-clay/10 border border-border focus:outline-none focus:ring-2 focus:ring-botanical-sage/30 transition-all font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-botanical-forest/60 ml-4">Password</label>
                <input type="password" disabled placeholder="Min 8 characters" className="w-full px-8 py-4 rounded-full bg-botanical-clay/10 border border-border focus:outline-none focus:ring-2 focus:ring-botanical-sage/30 transition-all font-medium" />
              </div>
              
              <div className="flex items-center gap-4 px-4 py-2">
                <input type="checkbox" checked readOnly className="w-5 h-5 rounded-full border-2 border-botanical-sage text-botanical-sage focus:ring-botanical-sage/30" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-botanical-forest/60">I agree to the botanical manifest</span>
              </div>

              <div className="space-y-4 pt-4">
                <BauhausButton type="submit" variant="primary" className="w-full" size="lg" disabled={isUserLoading}>
                  {isUserLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'START READING'}
                </BauhausButton>
                
                <BauhausButton 
                  onClick={handleDemoSignup}
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                  disabled={isUserLoading}
                >
                  INSTANT DEMO ACCESS
                </BauhausButton>
              </div>
            </form>

            <div className="mt-12 text-center border-t border-border/40 pt-10">
              <p className="text-xs font-bold text-botanical-forest/50 uppercase tracking-widest">
                Already registered? <Link href="/login" className="text-botanical-terracotta hover:underline">Sign In</Link>
              </p>
            </div>
          </BauhausCard>
        </div>
      </main>
    </div>
  );
}
