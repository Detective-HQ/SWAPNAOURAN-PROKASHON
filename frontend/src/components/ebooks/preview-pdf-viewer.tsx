'use client';

import { useState, useEffect } from 'react';
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

export function PreviewPdfViewer({ url, title, price, bookId, onClose }: PreviewPdfViewerProps) {
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const router = useRouter();

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'a', 's', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    const handleCopy = (e: ClipboardEvent) => e.preventDefault();

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
    };
  }, []);

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

  const pdfSrc = `${url}#toolbar=0&navpanes=0&scrollbar=1`;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black flex flex-col select-none"
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Header */}
      <div className="bg-[#F0C020] text-black p-4 flex items-center justify-between border-b-4 border-black relative z-10">
        <h2 className="text-xl font-black uppercase tracking-widest truncate max-w-[60%]">
          Preview: {title}
        </h2>
        <button onClick={onClose} className="hover:text-[#D02020] transition-colors bg-black/10 p-2 border-2 border-transparent hover:border-black rounded-full">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* PDF Container */}
      <div className="flex-grow relative bg-[#121212] overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-[#F0C020] font-black text-xl animate-pulse z-30">
            <Loader2 className="w-8 h-8 animate-spin mr-3" />
            Loading Preview...
          </div>
        )}

        <div className="w-full h-full relative">
          <iframe
            src={pdfSrc}
            className="w-full h-full border-0"
            onLoad={() => setLoading(false)}
            title={`Preview: ${title}`}
            sandbox="allow-same-origin allow-scripts"
          />
          {/* Transparent overlay to block text selection inside the iframe */}
          <div className="absolute inset-0 z-10" style={{ pointerEvents: 'auto', cursor: 'default' }} />
        </div>

        {/* Gradient at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-20" />
      </div>

      {/* Footer with Buy CTA */}
      {price !== undefined && bookId && (
        <div className="bg-white border-t-4 border-black p-4 flex items-center justify-center gap-8 z-10">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 mb-2">
              Enjoying the preview? Get the full book!
            </p>
            <button
              onClick={handleBuy}
              className="bg-[#D02020] text-white font-black py-3 px-8 border-2 border-black hover:bg-black hover:text-[#F0C020] transition-all uppercase tracking-wider flex items-center justify-center gap-3 mx-auto"
            >
              <ShoppingCart className="w-5 h-5" />
              Buy Now — ₹{price}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
