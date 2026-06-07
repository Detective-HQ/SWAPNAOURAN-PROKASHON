'use client';

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/use-api';
import { BauhausCard } from '@/components/bauhaus/bauhaus-card';
import { BauhausButton } from '@/components/bauhaus/bauhaus-primitives';
import { RotateCcw, Loader2, Package } from 'lucide-react';

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
  APPROVED: 'bg-blue-100 text-blue-700 border-blue-200',
  REJECTED: 'bg-rose-100 text-rose-700 border-rose-200',
  REFUNDED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export default function ReturnsPage() {
  const api = useApi();
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReturns();
  }, [api]);

  const fetchReturns = async () => {
    try {
      const res = await api.get('/returns');
      setReturns(res.data || []);
    } catch (err) {
      console.error('Failed to fetch returns:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-fade-up">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 text-botanical-sage uppercase tracking-[0.3em] text-[10px] font-bold">
          <div className="w-8 h-px bg-botanical-sage" />
          Support
        </div>
        <div className="flex items-center gap-4">
          <RotateCcw className="text-botanical-terracotta w-6 h-6" />
          <h1 className="text-5xl font-headline font-bold text-botanical-forest">Returns <span className="italic font-normal">& Refunds</span></h1>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-botanical-terracotta" /></div>
      ) : returns.length === 0 ? (
        <div className="p-20 text-center bg-botanical-clay rounded-[40px] border border-dashed border-yellow-500 border-border">
          <Package className="w-12 h-12 mx-auto text-botanical-forest/20 mb-4" />
          <p className="text-black font-bold uppercase tracking-[0.2em] text-xs italic">No return requests yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {returns.map((ret) => (
            <BauhausCard key={ret.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="font-headline font-bold text-botanical-forest">{ret.book?.title || 'Book'}</p>
                  <p className="text-sm text-botanical-forest/70">{ret.reason}</p>
                  {ret.adminNote && (
                    <p className="text-xs text-botanical-forest/50 italic">Admin note: {ret.adminNote}</p>
                  )}
                  <p className="text-[10px] text-botanical-forest/40">Order: #{ret.order?.invoiceNumber || ret.orderId.substring(0, 8)}</p>
                </div>
                <span className={`shrink-0 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${statusColors[ret.status] || 'bg-gray-100 text-gray-700'}`}>
                  {ret.status}
                </span>
              </div>
            </BauhausCard>
          ))}
        </div>
      )}
    </div>
  );
}
