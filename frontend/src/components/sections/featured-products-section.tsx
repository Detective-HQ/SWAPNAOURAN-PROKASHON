"use client";

import { FadeImage } from "@/components/fade-image";

const features = [
  {
    title: "দক্ষিণজঙ্গলের লোকদেবতারে",
    description: "প্রবন্ধ",
    image: "/dakhinjangaler lokdebtare.jpeg",
  },
  {
    title: "মেঘপিওনের ডাকচিঠি",
    description: "কাব্যগ্রন্থ",
    image: "/meghpioner dakchithi.jpeg",
  },
  {
    title: "প্রলাপ",
    description: "উপন্যাস",
    image: "/pralap.jpeg",
  },
  {
    title: "রহস্যময় পদ্মনাভস্বামী",
    description: "থ্রিলার",
    image: "/rahasyamoy padmanabhasami.jpeg",
  },
  {
    title: "শারদ উৎসব ২০২৫",
    description: "বিশেষ সংখ্যা",
    image: "/sarad utsab2025.jpeg",
  },
  {
    title: "স্মৃতির এশ্রাদ্ধ",
    description: "কবিতা",
    image: "/smritir esrad.jpeg",
  },
];

export function FeaturedProductsSection() {
  return (
    <section id="products" className="bg-background">
      {/* Section Title */}
      <div className="px-6 py-20 text-center md:px-12 md:py-28 lg:px-20 lg:py-32 lg:pb-20">
        <h2 className="text-3xl font-medium tracking-tight text-foreground md:text-4xl lg:text-5xl">
          আমাদের বিশেষ প্রকাশনা সমূহ
          <br />
          অক্ষরের মায়ায় সাজানো ভুবন
        </h2>
        <p className="mx-auto mt-6 max-w-md text-sm text-muted-foreground uppercase tracking-widest">
          নির্বাচিত বই
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 gap-4 px-6 pb-20 md:grid-cols-3 md:px-12 lg:px-20">
        {features.map((feature) => (
          <div key={feature.title} className="group">
            {/* Image */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted/50">
              <FadeImage
                src={feature.image || "/placeholder.svg"}
                alt={feature.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Content */}
            <div className="py-6">
              <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground font-medium">
                {feature.description}
              </p>
              <h3 className="text-foreground text-xl font-semibold leading-tight">
                {feature.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
