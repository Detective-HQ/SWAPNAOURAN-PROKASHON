'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

import { BauhausCard } from '@/components/bauhaus/bauhaus-card';
import { TrendingUp, ShoppingBag, BookOpen, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
  }, [user, isLoaded, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-botanical-forest"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-12 animate-fade-up">
      <header className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-border/40 pb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 text-botanical-sage uppercase tracking-[0.3em] text-[10px] font-bold">
            <div className="w-8 h-px bg-botanical-sage" />
            Home Base
          </div>
          <h1 className="text-6xl font-headline font-bold text-botanical-forest italic leading-[1.1]">Welcome Back, <br /><span className="not-italic text-botanical-terracotta">Reader.</span></h1>
        </div>
        <div className="flex gap-4">
           <div className="bg-white border border-border/40 rounded-[32px] p-6 flex flex-col items-center organic-shadow w-32">
              <span className="text-[9px] font-bold uppercase tracking-widest text-botanical-sage mb-2">Ebooks</span>
              <span className="text-3xl font-headline font-bold">12</span>
           </div>
           <div className="bg-botanical-clay border border-border/40 rounded-[32px] p-6 flex flex-col items-center organic-shadow w-32">
              <span className="text-[9px] font-bold uppercase tracking-widest text-botanical-forest/60 mb-2">Points</span>
              <span className="text-3xl font-headline font-bold">840</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
           <div />
        </div>
        <div className="space-y-8">
           <BauhausCard className="bg-botanical-forest text-botanical-alabaster relative overflow-hidden">
              <Star className="absolute -top-4 -right-4 w-24 h-24 text-white/5 rotate-12" />
              <h3 className="text-xl font-headline font-bold mb-8 flex items-center gap-3 italic">
                Recent <span className="not-italic">Activity</span>
              </h3>
              <ul className="space-y-6 font-medium text-sm">
                <li className="flex gap-4 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-botanical-terracotta mt-2 shrink-0" />
                  <p>Purchased <span className="italic">Digital Typography</span></p>
                </li>
                <li className="flex gap-4 items-start opacity-60">
                  <div className="w-1.5 h-1.5 rounded-full bg-botanical-sage mt-2 shrink-0" />
                  <p>Finished <span className="italic">Screen Modernism</span></p>
                </li>
                <li className="flex gap-4 items-start opacity-60">
                  <div className="w-1.5 h-1.5 rounded-full bg-botanical-clay mt-2 shrink-0" />
                  <p>Joined the <span className="italic">Botanical Archive</span></p>
                </li>
              </ul>
           </BauhausCard>

           <BauhausCard variant="clay" className="flex flex-col h-full">
              <h3 className="text-xl font-headline font-bold mb-6 flex items-center gap-3">
                Quick <span className="italic">Cart</span>
              </h3>
              <p className="text-sm font-medium text-botanical-forest/70 mb-8 leading-relaxed">
                You have 2 curated treasures waiting in your physical cart.
              </p>
              <div className="bg-white/50 border border-botanical-forest/10 p-6 rounded-[24px] mb-8 text-center">
                 <p className="text-[9px] font-bold uppercase tracking-widest opacity-40 mb-1">Estimated Total</p>
                 <p className="text-3xl font-headline font-bold text-botanical-terracotta">₹3,349</p>
              </div>
              <Link href="/dashboard/orders" className="mt-auto">
                <button className="w-full flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-botanical-forest hover:text-botanical-terracotta transition-colors group">
                  View Full Cart
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </button>
              </Link>
           </BauhausCard>
        </div>
      </div>
    </div>
  );
}
