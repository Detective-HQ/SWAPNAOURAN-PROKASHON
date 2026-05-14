"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Loader2, Mail } from "lucide-react";

const footerLinks = {
  explore: [
    { label: "বই", href: "/shop" },
    { label: "ই-বুক", href: "/ebooks" },
    { label: "গ্যালারি", href: "#gallery" },
    { label: "সংকলন", href: "#collection" },
  ],
  about: [
    { label: "আমাদের গল্প", href: "#" },
    { label: "লেখকবৃন্দ", href: "#" },
    { label: "ক্যারিয়ার", href: "#" },
    { label: "যোগাযোগ", href: "#" },
  ],
  service: [
    { label: "সাধারণ জিজ্ঞাসা", href: "#" },
    { label: "শিপিং", href: "#" },
    { label: "রিটার্ন", href: "#" },
    { label: "গোপনীয়তা নীতি", href: "#" },
  ],
};

export function FooterSection() {
  const [email, setEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [newsletterMsg, setNewsletterMsg] = useState("");

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setNewsletterStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Subscription failed");
      setNewsletterStatus("success");
      setNewsletterMsg("You're subscribed! Check your inbox for a free chapter.");
      setEmail("");
      setTimeout(() => setNewsletterStatus("idle"), 5000);
    } catch (err: any) {
      setNewsletterStatus("error");
      setNewsletterMsg(err.message || "Something went wrong");
    }
  };

  return (
    <footer className="bg-background">
      {/* Newsletter Section */}
      <div className="border-t border-border px-6 py-12 md:px-12 lg:px-20 bg-botanical-forest/5">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Mail className="w-8 h-8 mx-auto text-botanical-terracotta" />
          <h3 className="text-2xl font-headline font-bold text-botanical-forest">Join the <span className="italic font-normal">Bloomsletter</span></h3>
          <p className="text-sm text-botanical-forest/60 max-w-lg mx-auto">Get a free sample chapter, exclusive author insights, and early access to new releases.</p>
          <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-5 py-3 rounded-full bg-white border border-border/40 focus:outline-none focus:ring-2 focus:ring-botanical-terracotta/50 text-sm"
            />
            <button
              type="submit"
              disabled={newsletterStatus === "loading"}
              className="px-8 py-3 rounded-full bg-botanical-forest text-white font-bold text-sm uppercase tracking-widest hover:bg-botanical-forest/90 transition-all disabled:opacity-50"
            >
              {newsletterStatus === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
            </button>
          </form>
          {newsletterMsg && (
            <p className={`text-xs font-medium ${newsletterStatus === "success" ? "text-green-600" : "text-red-500"}`}>
              {newsletterStatus === "success" && <Check className="w-3 h-3 inline mr-1" />}
              {newsletterMsg}
            </p>
          )}
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="border-t border-border px-6 py-16 md:px-12 md:py-20 lg:px-20">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <Link href="/" className="text-lg font-medium text-foreground">
              SWAPNAOURAN PROKASHON
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              স্বপ্নউড়ান প্রকাশন - সাহিত্যের নতুন আকাশ। আমরা প্রতিটি পাণ্ডুলিপিকে যত্নে সাজিয়ে তুলি।
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="mb-4 text-sm font-medium text-foreground">Explore</h4>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="mb-4 text-sm font-medium text-foreground">About</h4>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service */}
          <div>
            <h4 className="mb-4 text-sm font-medium text-foreground">Service</h4>
            <ul className="space-y-3">
              {footerLinks.service.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border px-6 py-6 md:px-12 lg:px-20">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 SWAPNAOURAN PROKASHON. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <Link
              href="#"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Instagram
            </Link>
            <Link
              href="#"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Twitter
            </Link>
            <Link
              href="#"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              YouTube
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
