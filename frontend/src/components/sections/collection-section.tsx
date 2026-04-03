"use client";

import { FadeImage } from "@/components/fade-image";

const accessories = [
  {
    id: 1,
    name: "আত্মকথা ও কবিতা",
    description: "স্বপ্নউড়ান প্রকাশন",
    price: "৳ ২৫০",
    image: "/atmakatha and kobita.jpeg",
  },
  {
    id: 2,
    name: "বিনি সুতোর মেলা",
    description: "স্বপ্নউড়ান প্রকাশন",
    price: "৳ ১৮০",
    image: "/bini sutor mala.jpeg",
  },
  {
    id: 3,
    name: "বিশ্ব ছাড়িয়ে",
    description: "স্বপ্নউড়ান প্রকাশন",
    price: "৳ ৩০০",
    image: "/biswa chariye.jpeg",
  },
  {
    id: 4,
    name: "ক্লাসরুমের কবিতা",
    description: "স্বপ্নউড়ান প্রকাশন",
    price: "৳ ১৫০",
    image: "/classroomer kobita.jpeg",
  },
  {
    id: 5,
    name: "দক্ষিণজঙ্গলের লোকদেবতারে",
    description: "স্বপ্নউড়ান প্রকাশন",
    price: "৳ ২০০",
    image: "/dakhinjangaler lokdebtare.jpeg",
  },
  {
    id: 6,
    name: "মেঘপিওনের ডাকচিঠি",
    description: "স্বপ্নউড়ান প্রকাশন",
    price: "৳ ১২০",
    image: "/meghpioner dakchithi.jpeg",
  },
];

export function CollectionSection() {
  return (
    <section id="collection" className="bg-background">
      {/* Section Title */}
      <div className="px-6 py-20 md:px-12 lg:px-20 md:py-10">
        <h2 className="text-3xl font-medium tracking-tight text-foreground md:text-4xl">
          আমাদের বইয়ের সমাহার
        </h2>
      </div>

      {/* Accessories Grid/Carousel */}
      <div className="pb-24">
        {/* Mobile: Horizontal Carousel */}
        <div className="flex gap-6 overflow-x-auto px-6 pb-4 md:hidden snap-x snap-mandatory scrollbar-hide">
          {accessories.map((accessory) => (
            <div key={accessory.id} className="group flex-shrink-0 w-[75vw] snap-center">
              {/* Image */}
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary">
                <FadeImage
                  src={accessory.image || "/placeholder.svg"}
                  alt={accessory.name}
                  fill
                  className="object-cover group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="py-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium leading-snug text-foreground">
                      {accessory.name}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {accessory.description}
                    </p>
                  </div>
                  <span className="text-lg font-medium text-foreground">
                    {accessory.price}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-8 md:px-12 lg:px-20">
          {accessories.map((accessory) => (
            <div key={accessory.id} className="group">
              {/* Image */}
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary">
                <FadeImage
                  src={accessory.image || "/placeholder.svg"}
                  alt={accessory.name}
                  fill
                  className="object-cover group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="py-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium leading-snug text-foreground">
                      {accessory.name}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {accessory.description}
                    </p>
                  </div>
                  <span className="font-medium text-foreground text-2xl">
                    {accessory.price}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
