'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, SignUp } from '@clerk/nextjs';
import { BauhausCard } from '@/components/bauhaus/bauhaus-card';
import { Navbar } from '@/components/layout/navbar';
import { GeometricShape } from '@/components/bauhaus/bauhaus-primitives';

export default function SignupPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      router.push('/dashboard');
    }
  }, [user, isLoaded, router]);

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

            <div className="flex justify-center">
              <SignUp 
                appearance={{
                  elements: {
                    formButtonPrimary: 'bg-botanical-forest text-white hover:bg-botanical-forest/90',
                    card: 'bg-transparent',
                  },
                }}
              />
            </div>
          </BauhausCard>
        </div>
      </main>
    </div>
  );
}
