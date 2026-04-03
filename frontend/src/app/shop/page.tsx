'use client';

import Image from 'next/image';
import { Navbar } from '@/components/layout/navbar';
import { BauhausCard } from '@/components/bauhaus/bauhaus-card';
import { BauhausButton } from '@/components/bauhaus/bauhaus-primitives';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ShoppingCart, Search, Filter, SlidersHorizontal } from 'lucide-react';

export default function ShopPage() {
  const books = [
    {
      id: 1,
      title: "আত্মকথা ও কবিতা",
      author: "স্বপ্নউড়ান",
      price: "২৫০.০০",
      image: "/atmakatha and kobita.jpeg"
    },
    {
      id: 2,
      title: "বিনি সুতোর মেলা",
      author: "স্বপ্নউড়ান",
      price: "১৮০.০০",
      image: "/bini sutor mala.jpeg"
    },
    {
      id: 3,
      title: "বিশ্ব ছাড়িয়ে",
      author: "স্বপ্নউড়ান",
      price: "৩০০.০০",
      image: "/biswa chariye.jpeg"
    },
    {
      id: 4,
      title: "ক্লাসরুমের কবিতা",
      author: "স্বপ্নউড়ান",
      price: "১৫০.০০",
      image: "/classroomer kobita.jpeg"
    },
    {
      id: 5,
      title: "দক্ষিণজঙ্গলের লোকদেবতারে",
      author: "স্বপ্নউড়ান",
      price: "২০০.০০",
      image: "/dakhinjangaler lokdebtare.jpeg"
    },
    {
      id: 6,
      title: "মেঘপিওনের ডাকচিঠি",
      author: "স্বপ্নউড়ান",
      price: "১২০.০০",
      image: "/meghpioner dakchithi.jpeg"
    },
    {
      id: 7,
      title: "প্রলাপ",
      author: "স্বপ্নউড়ান",
      price: "৩৫০.০০",
      image: "/pralap.jpeg"
    },
    {
      id: 8,
      title: "রহস্যময় পদ্মনাভস্বামী",
      author: "স্বপ্নউড়ান",
      price: "৪০০.০০",
      image: "/rahasyamoy padmanabhasami.jpeg"
    },
    {
      id: 9,
      title: "শারদ উৎসব ২০২৫",
      author: "স্বপ্নউড়ান",
      price: "১০০.০০",
      image: "/sarad utsab2025.jpeg"
    },
    {
      id: 10,
      title: "স্মৃতির এশ্রাদ্ধ",
      author: "স্বপ্নউড়ান",
      price: "২০০.০০",
      image: "/smritir esrad.jpeg"
    },
    {
      id: 11,
      title: "উড়ান",
      author: "স্বপ্নউড়ান",
      price: "২৫০.০০",
      image: "/uran.jpeg"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <header className="py-24 px-6 lg:px-12 bg-white border-b border-border/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-botanical-sage uppercase tracking-[0.3em] text-xs font-bold">
              <div className="w-12 h-px bg-botanical-sage" />
              The Collection
            </div>
            <h1 className="text-6xl font-headline font-bold text-botanical-forest leading-none">Curated <br /> <span className="italic font-normal">Physical Library</span></h1>
          </div>
          
          <div className="flex w-full md:w-auto gap-4">
            <div className="relative flex-grow md:w-96">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-botanical-forest/30 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Find your story..." 
                className="w-full pl-16 pr-8 py-5 rounded-full bg-botanical-clay/10 border border-border font-medium focus:outline-none focus:ring-2 focus:ring-botanical-sage/30 transition-all"
              />
            </div>
            <BauhausButton variant="ghost" className="p-5 border border-border">
              <SlidersHorizontal className="w-5 h-5" />
            </BauhausButton>
          </div>
        </div>
      </header>

      <main className="py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
            {books.map((book) => (
              <div key={book.id} className="staggered-card">
                <BauhausCard>
                  <div className="aspect-[3/4] relative mb-8 rounded-[40px] overflow-hidden group">
                    <Image 
                      src={book.image} 
                      alt={book.title} 
                      fill 
                      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      data-ai-hint="book cover"
                    />
                    <div className="absolute top-4 left-4 bg-botanical-terracotta text-white px-4 py-1.5 rounded-full font-bold text-[10px] tracking-widest uppercase">
                      #{book.id}
                    </div>
                  </div>
                  <h2 className="text-xl font-headline font-bold mb-1 leading-tight">{book.title}</h2>
                  <p className="text-botanical-forest/40 font-medium text-xs mb-8 uppercase tracking-widest italic">{book.author}</p>
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-border/10">
                    <span className="text-2xl font-headline font-bold italic">${book.price}</span>
                    <BauhausButton variant="secondary" size="sm" className="px-4">
                      <ShoppingCart className="w-4 h-4" />
                    </BauhausButton>
                  </div>
                </BauhausCard>
              </div>
            ))}
          </div>
          
          <div className="mt-32 text-center">
            <BauhausButton variant="outline" size="lg">Load More Treasures</BauhausButton>
          </div>
        </div>
      </main>
    </div>
  );
}
