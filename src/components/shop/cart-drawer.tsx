"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BauhausButton } from "@/components/bauhaus/bauhaus-primitives";
import { ShoppingBag, X, Trash2 } from "lucide-react";
import { useState } from "react";

export function CartDrawer() {
  const [items, setItems] = useState([
    { id: 1, title: 'The Silent Modernist', price: 24.99, qty: 1 },
    { id: 2, title: 'Primary Colors', price: 19.99, qty: 1 }
  ]);

  const total = items.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="relative p-2 border-4 border-black bg-[#F0C020] hover:bg-[#F0C020]/90 transition-colors">
          <ShoppingBag className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-[#D02020] text-white w-6 h-6 flex items-center justify-center font-black text-xs border-2 border-black">
            {items.length}
          </span>
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md border-l-8 border-black p-0 flex flex-col">
        <SheetHeader className="p-8 border-b-4 border-black bg-white">
          <SheetTitle className="text-4xl font-black">YOUR CART</SheetTitle>
        </SheetHeader>
        
        <div className="flex-grow overflow-y-auto p-8 space-y-6 bauhaus-grid-dots bg-[#F0F0F0]">
          {items.map((item) => (
            <div key={item.id} className="bg-white border-4 border-black p-4 flex gap-4 bauhaus-shadow-sm">
              <div className="w-20 h-24 bg-[#1040C0] border-2 border-black flex-shrink-0"></div>
              <div className="flex-grow">
                <h3 className="font-black text-lg uppercase leading-none mb-1">{item.title}</h3>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">${item.price}</p>
                <div className="mt-4 flex justify-between items-center">
                   <div className="flex items-center border-2 border-black">
                      <button className="px-2 py-1 font-black">-</button>
                      <span className="px-3 py-1 font-black bg-black text-white">{item.qty}</span>
                      <button className="px-2 py-1 font-black">+</button>
                   </div>
                   <button className="text-[#D02020] hover:scale-110 transition-transform"><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 border-t-4 border-black bg-white space-y-6">
          <div className="flex justify-between items-end">
            <span className="text-xs font-black uppercase tracking-widest">Estimated Total</span>
            <span className="text-4xl font-black">${total.toFixed(2)}</span>
          </div>
          <BauhausButton variant="red" className="w-full" size="lg">PROCEED TO CHECKOUT</BauhausButton>
        </div>
      </SheetContent>
    </Sheet>
  );
}
