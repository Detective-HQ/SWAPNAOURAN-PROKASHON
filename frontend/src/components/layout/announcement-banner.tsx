"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { Megaphone, X } from "lucide-react";

export function AnnouncementBanner() {
  const api = useApi();
  const [banner, setBanner] = useState<{ text: string; active: boolean } | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await api.get("/settings/public");
        if (res?.data?.announcementBanner?.active) {
          setBanner(res.data.announcementBanner);
        }
      } catch (err) {
        console.error("Failed to load banner", err);
      }
    };
    fetchBanner();
  }, [api]);

  if (!banner || !banner.active || !isVisible) return null;

  return (
    <div className="bg-botanical-terracotta text-white px-4 py-2 relative overflow-hidden flex items-center">
      <div className="container mx-auto flex items-center justify-between">
        <div className="w-6 h-6 flex items-center justify-center shrink-0 z-10 bg-botanical-terracotta mr-2">
          <Megaphone className="w-4 h-4" />
        </div>
        
        <div className="flex-1 overflow-hidden relative h-6">
          <div className="absolute whitespace-nowrap animate-[marquee_20s_linear_infinite] hover:[animation-play-state:paused] text-sm font-medium tracking-wide">
            {banner.text}
          </div>
        </div>

        <button 
          onClick={() => setIsVisible(false)}
          className="ml-4 shrink-0 hover:bg-white/20 p-1 rounded-full transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Add this to tailwind config if not existing, or handle via index.css */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}} />
    </div>
  );
}
