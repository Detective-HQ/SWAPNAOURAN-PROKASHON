import { AIRecommendations } from '@/components/shop/ai-recommendations';
import { BauhausCard } from '@/components/bauhaus/bauhaus-card';
import { TrendingUp, ShoppingBag, BookOpen } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-8">
        <div>
          <h1 className="text-6xl font-black leading-none">WELCOME BACK,<br /><span className="text-[#D02020]">READER.</span></h1>
        </div>
        <div className="flex gap-4">
           <div className="bg-white border-4 border-black p-4 flex flex-col items-center">
              <span className="text-xs font-black uppercase tracking-widest">Active Ebooks</span>
              <span className="text-3xl font-black">12</span>
           </div>
           <div className="bg-[#F0C020] border-4 border-black p-4 flex flex-col items-center">
              <span className="text-xs font-black uppercase tracking-widest">Points</span>
              <span className="text-3xl font-black">840</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
           <AIRecommendations />
        </div>
        <div className="space-y-8">
           <BauhausCard decorationColor="red" className="bg-[#121212] text-white">
              <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-[#F0C020]" />
                RECENT ACTIVITY
              </h3>
              <ul className="space-y-4 font-bold text-sm">
                <li className="border-l-2 border-[#D02020] pl-4">Purchased 'Digital Typography'</li>
                <li className="border-l-2 border-[#1040C0] pl-4 opacity-60">Finished 'Volume 3'</li>
                <li className="border-l-2 border-[#F0C020] pl-4 opacity-60">Joined 'Masters Collection'</li>
              </ul>
           </BauhausCard>

           <BauhausCard decorationShape="circle" decorationColor="blue">
              <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                <ShoppingBag size={20} className="text-[#1040C0]" />
                QUICK CART
              </h3>
              <p className="text-sm font-medium mb-6">You have 3 items waiting in your physical cart.</p>
              <div className="bg-[#F0F0F0] border-2 border-black p-4 text-xs font-black text-center">
                 ESTIMATED TOTAL: $64.50
              </div>
           </BauhausCard>
        </div>
      </div>
    </div>
  );
}
