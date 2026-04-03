'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { BauhausButton, GeometricShape } from '@/components/bauhaus/bauhaus-primitives';
import { BauhausCard } from '@/components/bauhaus/bauhaus-card';
import { Star, ArrowRight } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser } from '@/firebase';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const featuredBooks = [
    { id: 1, title: 'The Silent Modernist', author: 'L. Van der Rohe', price: '$24.99', image: PlaceHolderImages[0].imageUrl },
    { id: 2, title: 'Primary Colors', author: 'K. Malevich', price: '$19.99', image: PlaceHolderImages[1].imageUrl },
    { id: 3, title: 'Form & Function', author: 'W. Gropius', price: '$32.00', image: PlaceHolderImages[2].imageUrl },
  ];

  if (isUserLoading) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="relative pt-24 pb-48 px-6 lg:px-12 overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12 animate-fade-up">
              <div className="inline-flex items-center gap-2 text-botanical-sage uppercase tracking-[0.3em] text-xs font-bold">
                <div className="w-12 h-px bg-botanical-sage" />
                Curated Literary Excellence
              </div>
              <h1 className="text-6xl lg:text-8xl font-headline font-bold text-botanical-forest leading-[1.1]">
                Nurture your <br />
                <span className="italic font-normal text-botanical-terracotta">imagination</span>
              </h1>
              <p className="text-xl text-botanical-forest/70 font-medium max-w-lg leading-relaxed">
                A sanctuary for slow reading and architectural stories. Discover hand-picked collections from independent publishers around the globe.
              </p>
              <div className="flex flex-wrap gap-6">
                <Link href="/shop">
                  <BauhausButton variant="primary" size="lg">Explore Shop</BauhausButton>
                </Link>
                <Link href="/signup">
                  <BauhausButton variant="outline" size="lg">Join Community</BauhausButton>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="arch-image relative aspect-[4/5] overflow-hidden organic-shadow-lg">
                <Image 
                  src={PlaceHolderImages[3].imageUrl} 
                  alt="Botanical Library" 
                  fill 
                  className="object-cover hover:scale-105 transition-transform duration-[2000ms]"
                  data-ai-hint="library garden"
                />
              </div>
              <div className="absolute -bottom-12 -left-12 p-8 bg-[#DCCFC2] rounded-[40px] organic-shadow max-w-xs space-y-4">
                <p className="font-headline italic text-lg text-botanical-forest">"Reading is the garden of the mind."</p>
                <p className="text-xs uppercase tracking-widest font-bold opacity-60">— The Collective</p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED BOOKS */}
        <section className="py-32 bg-[#F2F0EB]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
              <div className="space-y-4">
                <h2 className="text-5xl lg:text-7xl font-headline font-bold text-botanical-forest">Seasonal Edits</h2>
                <p className="text-botanical-sage uppercase tracking-[0.2em] font-bold text-xs">Stories that bloom in the current season</p>
              </div>
              <Link href="/shop">
                <BauhausButton variant="ghost" className="group">
                  View Full Catalog <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                </BauhausButton>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {featuredBooks.map((book) => (
                <div key={book.id} className="staggered-card">
                  <BauhausCard>
                    <div className="aspect-[3/4] relative mb-8 rounded-[40px] overflow-hidden">
                      <Image 
                        src={book.image} 
                        alt={book.title} 
                        fill 
                        className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                        data-ai-hint="book cover"
                      />
                    </div>
                    <h3 className="text-2xl font-headline font-bold mb-2">{book.title}</h3>
                    <p className="text-botanical-forest/50 font-medium text-sm mb-8 uppercase tracking-widest">{book.author}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold italic">{book.price}</span>
                      <BauhausButton variant="secondary" size="sm">Details</BauhausButton>
                    </div>
                  </BauhausCard>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ADVERTISEMENT - ARCHITECTURAL BLOCK */}
        <section className="py-48 bg-botanical-forest text-botanical-alabaster overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[#8C9A84]/10 rounded-l-full" />
          <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative z-10">
            <div className="space-y-12">
              <h2 className="text-6xl lg:text-8xl font-headline italic font-normal leading-tight">The Master's <br /><span className="not-italic font-bold">Archive</span></h2>
              <p className="text-xl font-medium opacity-80 leading-relaxed max-w-lg">
                Exclusive limited editions and hand-pressed manuscripts. A collection built for the dedicated bibliophile.
              </p>
              <BauhausButton variant="terracotta" size="lg">Join The Archive</BauhausButton>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="rounded-full bg-botanical-alabaster/10 aspect-square p-8 flex flex-col justify-center items-center text-center">
                <span className="text-5xl font-headline font-bold">12</span>
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60">Rare Releases</span>
              </div>
              <div className="arch-image bg-botanical-clay border border-white/10" />
              <div className="arch-image bg-botanical-sage rotate-180" />
              <div className="rounded-full bg-botanical-terracotta/20 aspect-square flex items-center justify-center">
                 <Star className="text-botanical-terracotta w-16 h-16 animate-pulse" />
              </div>
            </div>
          </div>
        </section>

        {/* MEMBERSHIP */}
        <section className="py-32 px-6 lg:px-12 bg-background">
          <div className="max-w-7xl mx-auto text-center space-y-16">
            <h2 className="text-5xl font-headline font-bold">Membership</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <BauhausCard className="flex flex-col items-center text-center">
                <h3 className="text-xl font-bold uppercase tracking-widest text-botanical-sage mb-4">Seed</h3>
                <p className="text-4xl font-headline font-bold mb-8">$9.99</p>
                <ul className="space-y-4 mb-12 text-sm font-medium text-botanical-forest/60">
                  <li>1 Curated Book / mo</li>
                  <li>Digital Archive Access</li>
                  <li>Early Access to Events</li>
                </ul>
                <BauhausButton variant="outline" className="w-full">Select Plan</BauhausButton>
              </BauhausCard>

              <BauhausCard variant="clay" className="flex flex-col items-center text-center md:-translate-y-8 organic-shadow-lg">
                <h3 className="text-xl font-bold uppercase tracking-widest text-botanical-forest mb-4">Bloom</h3>
                <p className="text-4xl font-headline font-bold mb-8">$24.99</p>
                <ul className="space-y-4 mb-12 text-sm font-medium text-botanical-forest">
                  <li>3 Curated Books / mo</li>
                  <li>Unlimited Ebook Downloads</li>
                  <li>Private Reader's Forum</li>
                  <li>Free Domestic Shipping</li>
                </ul>
                <BauhausButton variant="primary" className="w-full">Select Plan</BauhausButton>
              </BauhausCard>

              <BauhausCard className="flex flex-col items-center text-center">
                <h3 className="text-xl font-bold uppercase tracking-widest text-botanical-terracotta mb-4">Forest</h3>
                <p className="text-4xl font-headline font-bold mb-8">$49.99</p>
                <ul className="space-y-4 mb-12 text-sm font-medium text-botanical-forest/60">
                  <li>5 Curated Books / mo</li>
                  <li>Exclusive Press Editions</li>
                  <li>Global Free Shipping</li>
                  <li>Personal Concierge</li>
                </ul>
                <BauhausButton variant="outline" className="w-full">Select Plan</BauhausButton>
              </BauhausCard>
            </div>
          </div>
        </section>

        {/* NEWSLETTER */}
        <section className="py-48 px-6 lg:px-12 bg-botanical-clay/30">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <h2 className="text-5xl lg:text-7xl font-headline font-bold leading-tight">Stay rooted in <br /><span className="italic font-normal">the collective</span></h2>
            <p className="text-lg text-botanical-forest/70 font-medium">Weekly insights into the world of slow reading and botanical design.</p>
            <form className="flex flex-col sm:flex-row gap-4 p-2 bg-white rounded-full organic-shadow border border-border">
              <input 
                type="email" 
                placeholder="YOUR EMAIL" 
                className="flex-grow px-8 py-4 rounded-full bg-transparent focus:outline-none font-medium"
              />
              <BauhausButton variant="terracotta" size="md">Subscribe</BauhausButton>
            </form>
          </div>
        </section>
      </main>

      <footer className="bg-botanical-forest text-botanical-alabaster py-32 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-24">
          <div className="col-span-1 md:col-span-2 space-y-12">
            <div className="flex items-center gap-4">
               <GeometricShape type="arch" color="sage" className="w-8 h-12" />
               <span className="font-headline font-bold text-3xl">Swapno Uran</span>
            </div>
            <p className="text-botanical-alabaster/60 text-lg font-medium leading-relaxed max-w-sm italic">
              "Every book is a seed. Every reader is a gardener."
            </p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.3em] font-bold text-botanical-terracotta mb-10">Sanctuary</h4>
            <ul className="space-y-6 text-sm font-medium opacity-80">
              <li><Link href="/shop" className="hover:text-botanical-sage transition-colors">THE SHOP</Link></li>
              <li><Link href="/ebooks" className="hover:text-botanical-sage transition-colors">EBOOKS</Link></li>
              <li><Link href="/photo-time" className="hover:text-botanical-sage transition-colors">GALLERY</Link></li>
              <li><Link href="/about" className="hover:text-botanical-sage transition-colors">OUR STORY</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.3em] font-bold text-botanical-sage mb-10">Ties</h4>
            <ul className="space-y-6 text-sm font-medium opacity-80">
              <li>EMAIL: HELLO@SWAPNO.URAN</li>
              <li>PHONE: +880 123 456 789</li>
              <li>INSTA: @SWAPNO_URAN</li>
              <li>X: @SWAPNOURAN</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-32 pt-12 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6 text-[10px] font-bold opacity-40 tracking-[0.3em]">
          <span>&copy; 2024 SWAPNO URAN PRAKASHAN. ALL RIGHTS RESERVED.</span>
          <div className="flex gap-12">
            <Link href="/privacy" className="hover:text-white">PRIVACY</Link>
            <Link href="/terms" className="hover:text-white">TERMS</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
