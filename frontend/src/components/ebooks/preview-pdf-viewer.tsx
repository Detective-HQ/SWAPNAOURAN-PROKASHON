'use client';

import { useState } from 'react';
import { X, ShoppingCart, Loader2 } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useRouter } from 'next/navigation';

interface PreviewPdfViewerProps {
  url: string;
  title: string;
  price?: number;
  bookId?: string;
  onClose: () => void;
}

export default function PreviewPdfViewer({ url, title, price, bookId, onClose }: PreviewPdfViewerProps) {
  const [loading, setLoading] = useState(true);
  const [showCta, setShowCta] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  const handleBuy = () => {
    if (bookId && price !== undefined) {
      addItem({
        id: bookId,
        title,
        author: 'Swapno Uran Prakashan',
        price,
        image: '',
      });
      onClose();
      router.push('/dashboard/orders');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="bg-[#F0C020] text-black p-4 flex items-center justify-between border-b-4 border-black relative z-10">
        <h2 className="text-xl font-black uppercase tracking-widest truncate max-w-[60%]">
          Preview: {title}
        </h2>
        <div className="flex items-center gap-3">
          {price !== undefined && bookId && !showCta && (
            <button
              onClick={handleBuy}
              className="bg-[#D02020] text-white font-black px-4 py-2 border-2 border-black hover:bg-black hover:text-[#F0C020] transition-all uppercase tracking-wider text-xs flex items-center gap-2 rounded-lg"
            >
              <ShoppingCart className="w-4 h-4" />
              Buy ₹{price}
            </button>
          )}
          <button onClick={onClose} className="hover:text-[#D02020] transition-colors bg-black/10 p-2 border-2 border-transparent hover:border-black rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex-grow relative bg-[#121212]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-[#F0C020] font-black text-xl animate-pulse z-20">
            <Loader2 className="w-8 h-8 animate-spin mr-3" />
            Loading Preview...
          </div>
        )}
        <iframe
          src={url}
          className="w-full h-full"
          title={`Preview: ${title}`}
          onLoad={() => setLoading(false)}
        />

        {showCta && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-30">
            <div className="bg-white border-4 border-black p-8 max-w-sm mx-4 text-center rounded-xl">
              <div className="w-16 h-1 bg-[#D02020] mx-auto mb-6" />
              <h3 className="text-2xl font-black mb-3 uppercase">Unlock Full Book</h3>
              <p className="text-sm font-medium text-gray-600 mb-6">
                You've seen the preview. Purchase to read the complete book.
              </p>
              {price !== undefined && bookId && (
                <button
                  onClick={handleBuy}
                  className="w-full bg-[#D02020] text-white font-black py-4 px-8 border-2 border-black hover:bg-black hover:text-[#F0C020] transition-all uppercase tracking-wider flex items-center justify-center gap-3 rounded-lg"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Buy Now — ₹{price}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {!showCta && (
        <div className="bg-white border-t-4 border-black p-4 flex items-center justify-center gap-4 fixed bottom-0 left-0 right-0 z-10">
          <button
            onClick={() => setShowCta(true)}
            className="bg-[#D02020] text-white font-black py-3 px-8 border-2 border-black hover:bg-black hover:text-[#F0C020] transition-all uppercase tracking-wider flex items-center gap-3 rounded-lg"
          >
            <ShoppingCart className="w-5 h-5" />
            Buy to Read Full Book — ₹{price}
          </button>
        </div>
      )}
    </div>
  );
}
