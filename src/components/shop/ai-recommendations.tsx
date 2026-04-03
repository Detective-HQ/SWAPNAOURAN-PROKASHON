"use client";

import { useEffect, useState } from 'react';
import { aiBookRecommendationTool, BookRecommendationOutput } from '@/ai/flows/ai-book-recommendation-tool';
import { BauhausCard } from '@/components/bauhaus/bauhaus-card';
import { BauhausButton } from '@/components/bauhaus/bauhaus-primitives';
import { Sparkles, Loader2 } from 'lucide-react';

export function AIRecommendations() {
  const [recommendations, setRecommendations] = useState<BookRecommendationOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getRecs() {
      try {
        const result = await aiBookRecommendationTool({
          browsingHistory: ['Modern Typography', 'Design Systems'],
          pastPurchases: ['Bauhaus Posters', 'Grid Systems in Graphic Design']
        });
        setRecommendations(result);
      } catch (e) {
        console.error("AI recommendation failed", e);
      } finally {
        setLoading(false);
      }
    }
    getRecs();
  }, []);

  if (loading) {
    return (
      <div className="bg-botanical-clay/20 p-16 rounded-[40px] border border-border text-center space-y-6">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-botanical-sage" />
        <p className="font-medium uppercase tracking-[0.2em] text-xs text-botanical-forest/60">Cultivating your library...</p>
      </div>
    );
  }

  if (!recommendations) return null;

  return (
    <div className="bg-botanical-forest p-16 rounded-[40px] text-botanical-alabaster space-y-16">
      <div className="flex flex-col md:flex-row items-center gap-8 md:justify-between">
        <div className="flex items-center gap-6">
          <div className="bg-botanical-terracotta p-4 rounded-full text-white organic-shadow">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-headline italic font-normal">AI <span className="not-italic font-bold">Curated Edits</span></h2>
        </div>
        <p className="text-sm font-medium opacity-60 uppercase tracking-widest">Personalized for your aesthetic</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {recommendations.recommendations.map((rec, i) => (
          <BauhausCard key={i} className="text-botanical-forest" variant="white">
            <h3 className="text-xl font-headline font-bold mb-1">{rec.title}</h3>
            <p className="text-botanical-forest/50 font-medium text-sm mb-12 italic">{rec.author}</p>
            <BauhausButton variant="terracotta" className="w-full">Discover</BauhausButton>
          </BauhausCard>
        ))}
      </div>
    </div>
  );
}
