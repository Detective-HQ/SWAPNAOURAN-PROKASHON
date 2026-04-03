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
      <div className="bg-[#F0C020] p-12 border-4 border-black text-center bauhaus-grid-dots">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
        <p className="font-black uppercase tracking-widest">Constructing recommendations...</p>
      </div>
    );
  }

  if (!recommendations) return null;

  return (
    <div className="bg-[#1040C0] p-12 border-4 border-black text-white">
      <div className="flex items-center gap-4 mb-12">
        <div className="bg-[#D02020] p-2 border-2 border-white rounded-full">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-4xl font-black">AI CURATED FOR YOU</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {recommendations.recommendations.map((rec, i) => (
          <BauhausCard key={i} className="text-black" decorationColor="yellow">
            <h3 className="text-xl font-black mb-1">{rec.title}</h3>
            <p className="text-muted-foreground font-bold mb-6">{rec.author}</p>
            <BauhausButton variant="black" className="w-full">View Details</BauhausButton>
          </BauhausCard>
        ))}
      </div>
    </div>
  );
}
