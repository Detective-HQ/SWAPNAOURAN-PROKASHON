'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from "@/components/layout/navbar";
import { BookstoreHero } from "@/components/landing/bookstore-hero";
import { FeaturedShowcase } from "@/components/landing/featured-showcase";
import { BestsellerGrid } from "@/components/landing/bestseller-grid";
import { NewsletterSection } from "@/components/landing/newsletter-section";
import { FooterSection } from "@/components/sections/footer-section";
import { useUser } from "@/firebase";

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  return (
    <main className="min-h-screen bg-background selection:bg-botanical-terracotta/30">
      <Navbar />
      <BookstoreHero />
      <FeaturedShowcase />
      <div className="bg-botanical-clay/20 py-24">
        <BestsellerGrid />
      </div>
      <NewsletterSection />
      <FooterSection />
    </main>
  );
}
