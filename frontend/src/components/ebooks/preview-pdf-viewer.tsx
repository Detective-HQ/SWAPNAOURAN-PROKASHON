'use client';

import { useState, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, ShoppingCart, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useRouter } from 'next/navigation';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Use CDN worker to avoid Webpack bundling issues
pdfjs.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PREVIEW_MAX_PAGES = 4;

interface PreviewPdfViewerProps {
  url: string;
  title: string;
  price?: number;
  bookId?: string;
  onClose: () => void;
}

export default function PreviewPdfViewer({ url, title, price, bookId, onClose }: PreviewPdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
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

  const onDocumentLoadSuccess = useCallback(({ numPages: pages }: { numPages: number }) => {
    setNumPages(pages);
    setLoading(false);
  }, []);

  const maxPage = Math.min(numPages || PREVIEW_MAX_PAGES, PREVIEW_MAX_PAGES);
  const isLastPreviewPage = pageNumber >= maxPage;

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
    <div
      className="fixed inset-0 z-[100] bg-black flex flex-col select-none"
      style={{ userSelect: 'none' }}
      onCopy={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Header */}
      <div className="bg-[#F0C020] text-black p-4 flex items-center justify-between border-b-4 border-black relative z-10">
        <h2 className="text-xl font-black uppercase tracking-widest truncate max-w-[60%]">
          Preview: {title}
        </h2>
        <button onClick={onClose} className="hover:text-[#D02020] transition-colors bg-black/10 p-2 border-2 border-transparent hover:border-black rounded-lg">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* PDF Container */}
      <div className="flex-grow overflow-auto relative flex justify-center bg-[#121212] pt-8 pb-20">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-[#F0C020] font-black text-xl animate-pulse z-20">
            <Loader2 className="w-8 h-8 animate-spin mr-3" />
            Loading Preview...
          </div>
        )}

        <div className="relative inline-block shadow-2xl">
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={null}
            className="border-4 border-black"
          >
            <Page
              pageNumber={pageNumber}
              scale={1.2}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="bg-white"
            />
          </Document>

          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 pointer-events-none z-10" />

          {isLastPreviewPage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-30">
              <div className="bg-white border-4 border-black p-8 max-w-sm mx-4 text-center -mt-16 rounded-xl">
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

          {/* Interaction blocker */}
          <div className="absolute inset-0 z-20 pointer-events-auto" />
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-white border-t-4 border-black p-4 flex items-center justify-center gap-8 fixed bottom-0 left-0 right-0 z-10">
        <button
          disabled={pageNumber <= 1}
          onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
          className="flex items-center gap-2 font-black uppercase tracking-widest text-[#D02020] hover:text-[#1040C0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-6 h-6" /> Previous
        </button>
        <div className="font-black text-lg">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin inline" />
          ) : (
            <>Page {pageNumber} of {maxPage} (Preview)</>
          )}
        </div>
        <button
          disabled={pageNumber >= maxPage}
          onClick={() => setPageNumber((p) => Math.min(maxPage, p + 1))}
          className="flex items-center gap-2 font-black uppercase tracking-widest text-[#1040C0] hover:text-[#D02020] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
