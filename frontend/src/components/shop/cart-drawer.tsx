"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BauhausButton } from "@/components/bauhaus/bauhaus-primitives";
import { useCart } from "@/lib/cart-context";
import { ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import Link from 'next/link';

export function CartDrawer() {
  const { items, removeItem, total } = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="relative p-3 rounded-full bg-botanical-clay/20 hover:bg-botanical-clay/40 transition-colors group">
          <ShoppingBag className="w-5 h-5 text-botanical-forest transition-transform group-hover:scale-110" />
          <span className="absolute -top-1 -right-1 bg-botanical-terracotta text-white w-5 h-5 flex items-center justify-center font-bold text-[9px] rounded-full border-2 border-white">
            {items.length}
          </span>
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col border-l border-border/40 bg-background">
        <SheetHeader className="p-10 border-b border-border bg-white/50 backdrop-blur-md sticky top-0 z-10">
          <SheetTitle className="text-3xl font-headline font-bold italic">Your <span className="not-italic">Sanctuary</span></SheetTitle>
        </SheetHeader>
        
        <div className="flex-grow overflow-y-auto p-8 space-y-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-[32px] p-6 flex gap-6 organic-shadow border border-border/40 group hover:-translate-y-1 transition-all">
              <div className="w-20 h-28 bg-botanical-clay/30 rounded-2xl overflow-hidden flex-shrink-0" />
              <div className="flex-grow flex flex-col">
                <h3 className="font-headline font-bold text-lg leading-tight mb-1">{item.title}</h3>
                <p className="text-[10px] font-bold text-botanical-sage uppercase tracking-widest italic mb-auto">Curated Selection</p>
                <div className="flex justify-between items-center pt-4">
                  <span className="font-bold text-botanical-forest italic">₹{item.price.toLocaleString()}</span>
                  <div className="flex items-center gap-4">
                    <button className="text-red-400 hover:text-red-600 transition-colors" onClick={() => removeItem(item.id)}>
                      <Trash2 size={16} />
                    </button>
                    <span className="text-xs font-bold px-3 py-1 bg-botanical-clay/20 rounded-full">{item.qty}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center py-20 text-botanical-forest/30 font-bold uppercase tracking-widest text-xs italic">
              Empty garden...
            </div>
          )}
        </div>

        <div className="p-10 border-t border-border bg-white/80 backdrop-blur-md space-y-8">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-bold uppercase tracking-widest text-botanical-sage">Estimated Total</span>
            <span className="text-3xl font-bold italic text-botanical-forest">₹{total.toLocaleString()}</span>
          </div>
          <Link href="/dashboard/orders" className="block">
            <BauhausButton variant="primary" className="w-full group" size="lg">
              PROCEED TO CHECKOUT
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </BauhausButton>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
