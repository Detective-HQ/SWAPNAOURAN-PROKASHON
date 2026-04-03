'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, SignIn } from '@clerk/nextjs';
import { Navbar } from '@/components/layout/navbar';
import { BauhausCard } from '@/components/bauhaus/bauhaus-card';
import { GeometricShape } from '@/components/bauhaus/bauhaus-primitives';

export default function LoginPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      router.push('/dashboard');
    }
  }, [user, isLoaded, router]);

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md relative">
          <div className="absolute -top-16 -left-16 opacity-20 hidden md:block">
            <GeometricShape type="square" color="sage" className="w-48 h-48" />
          </div>
          <div className="absolute -bottom-16 -right-16 opacity-20 hidden md:block">
            <GeometricShape type="square" color="clay" className="w-48 h-48 rotate-12" />
          </div>
          
          <BauhausCard className="p-10 lg:p-16 border border-border/40">
            <div className="text-center space-y-4 mb-12">
              <h1 className="text-4xl font-headline font-bold text-botanical-forest italic">Welcome Back</h1>
              <p className="text-xs uppercase tracking-[0.3em] font-bold text-botanical-sage">Enter your sanctuary</p>
            </div>

            <div className="flex justify-center">
              <SignIn 
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
