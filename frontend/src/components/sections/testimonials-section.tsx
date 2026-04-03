"use client";

import Image from "next/image";

export function TestimonialsSection() {
  return (
    <section id="about" className="bg-background">
      {/* Large Text Statement */}
      <div className="px-6 py-24 md:px-12 md:py-32 lg:px-20 lg:py-40">
        <p className="mx-auto max-w-5xl text-2xl leading-relaxed text-foreground md:text-3xl lg:text-[2.5rem] lg:leading-snug">
          স্বপ্নউড়ান প্রকাশন প্রতিটি সৃজনশীল মানুষের ঘর। আমরা বিশ্বাস করি আপনার গল্পটি বিশ্বের কাছে পৌঁছে দেওয়ার দায়িত্ব আমাদের। 
          গুণগত মান এবং শৈল্পিক উৎকর্ষতা আমাদের প্রতিটি কাজের বৈশিষ্ট্য।
        </p>
      </div>

      {/* About Image */}
      <div className="relative aspect-[16/9] w-full">
        <Image
          src="/sarad utsab2025.jpeg"
          alt="Sarad Utsab 2025"
          fill
          className="object-cover"
        />
        {/* Fade gradient overlay - white at bottom fading to transparent at top */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>
    </section>
  );
}
