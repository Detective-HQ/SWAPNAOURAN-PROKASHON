"use client";

import Link from "next/link";
import { GeometricShape } from "@/components/bauhaus/bauhaus-primitives";

const footerLinks = {
  explore: [
    { label: "New Arrivals", href: "#" },
    { label: "Bestsellers", href: "#" },
    { label: "Ebooks", href: "/login" },
    { label: "Publishers", href: "#" },
  ],
  about: [
    { label: "Our Story", href: "#" },
    { label: "Sustainability", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  support: [
    { label: "Shipping Info", href: "#" },
    { label: "Returns", href: "#" },
    { label: "FAQ", href: "#" },
    { label: "Gift Cards", href: "#" },
  ],
};

export function FooterSection() {
  return (
    <footer className="bg-botanical-alabaster border-t border-border/40">
      <div className="max-w-7xl mx-auto px-6 py-24 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-8">
            <Link href="/" className="flex items-center gap-4 group">
              <GeometricShape type="square" color="sage" className="w-10 h-10" />
              <span className="font-headline font-bold text-2xl tracking-tight text-botanical-forest italic">Swapno Uran</span>
            </Link>
            <p className="max-w-xs text-botanical-forest/60 text-sm leading-relaxed font-medium">
              Curating literary treasures for the discerning reader. A sanctuary where stories find their true form through design and quality.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-botanical-sage">Explore</h4>
            <ul className="space-y-4">
              {footerLinks.explore.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm font-medium text-botanical-forest/70 hover:text-botanical-terracotta transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-botanical-sage">Sanctuary</h4>
            <ul className="space-y-4">
              {footerLinks.about.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm font-medium text-botanical-forest/70 hover:text-botanical-terracotta transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-botanical-sage">Service</h4>
            <ul className="space-y-4">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm font-medium text-botanical-forest/70 hover:text-botanical-terracotta transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-border/20 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-botanical-forest/40">
            © {new Date().getFullYear()} Swapno Uran Prakashan. Crafted with intention.
          </p>
          <div className="flex gap-8">
            <Link href="#" className="text-[10px] font-bold uppercase tracking-[0.2em] text-botanical-forest/40 hover:text-botanical-terracotta transition-colors">Instagram</Link>
            <Link href="#" className="text-[10px] font-bold uppercase tracking-[0.2em] text-botanical-forest/40 hover:text-botanical-terracotta transition-colors">Journal</Link>
            <Link href="#" className="text-[10px] font-bold uppercase tracking-[0.2em] text-botanical-forest/40 hover:text-botanical-terracotta transition-colors">Newsletter</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
