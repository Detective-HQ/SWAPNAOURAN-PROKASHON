'use client';

import { BauhausButton } from "@/components/bauhaus/bauhaus-primitives";

export function NewsletterSection() {
  return (
    <section className="py-32 px-6 lg:px-12 bg-botanical-forest text-botanical-alabaster overflow-hidden relative">
      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-botanical-terracotta/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl" />

      <div className="max-w-4xl mx-auto text-center space-y-12 relative z-10">
        <div className="space-y-4">
          <h2 className="text-5xl md:text-6xl font-headline font-bold leading-tight">
            Join Our <span className="italic font-normal text-botanical-clay">Reader</span> Community
          </h2>
          <p className="text-lg text-botanical-alabaster/60 font-medium max-w-xl mx-auto">
            Subscribe to receive insights from independent publishers, early access to new volumes, and exclusive botanical edits.
          </p>
        </div>

        <form className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto" onSubmit={(e) => e.preventDefault()}>
          <input 
            type="email" 
            placeholder="your.email@sanctuary.com"
            className="flex-grow px-8 py-5 rounded-full bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-botanical-terracotta transition-all text-botanical-alabaster placeholder:text-botanical-alabaster/30 font-medium"
          />
          <BauhausButton variant="terracotta" size="lg" className="px-12">
            Subscribe
          </BauhausButton>
        </form>
        
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">
          No digital noise. Only curated literature.
        </p>
      </div>
    </section>
  );
}
