'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ShoppingCart, Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useRouter } from 'next/navigation';

const PREVIEW_MAX_PAGES = 4;

interface PreviewPdfViewerProps {
  url: string;
  title: string;
  price?: number;
  bookId?: string;
  onClose: () => void;
}

export default function PreviewPdfViewer({ url, title, price, bookId, onClose }: PreviewPdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1.2);
  const [showCta, setShowCta] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  // Load PDF.js from CDN
  useEffect(() => {
    const loadPdfJs = async () => {
      if (!(window as any).pdfjsLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.async = true;
        document.body.appendChild(script);

        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      try {
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setLoading(false);
      }
    };

    loadPdfJs();
  }, [url]);

  // Render the page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let renderTask: any = null;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const viewport = page.getViewport({ scale });
        const outputScale = window.devicePixelRatio || 1;
        
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = Math.floor(viewport.width) + "px";
        canvas.style.height =  Math.floor(viewport.height) + "px";

        const transform = outputScale !== 1
          ? [outputScale, 0, 0, outputScale, 0, 0]
          : null;

        const renderContext = {
          canvasContext: ctx,
          transform: transform,
          viewport: viewport,
        };

        renderTask = page.render(renderContext);
        await renderTask.promise;
      } catch (err) {
        if ((err as any)?.name !== 'RenderingCancelledException') {
          console.error('Error rendering page:', err);
        }
      }
    };

    renderPage();

    return () => {
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, pageNum, scale]);

  // Copy protection
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'a', 's', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const maxPage = Math.min(numPages || PREVIEW_MAX_PAGES, PREVIEW_MAX_PAGES);
  const isLastPreviewPage = pageNum >= maxPage;

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
    <div className="fixed inset-0 z-[100] bg-black flex flex-col select-none">
      {/* Header */}
      <div className="bg-[#F0C020] text-black p-4 flex items-center justify-between border-b-4 border-black relative z-10">
        <h2 className="text-xl font-black uppercase tracking-widest truncate max-w-[50%]">
          Preview: {title}
        </h2>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-black/10 rounded-lg px-4 py-1 border-2 border-black hidden sm:flex">
            <button onClick={() => setScale((s) => Math.max(0.5, s - 0.2))} className="hover:text-[#D02020]">
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold w-12 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale((s) => Math.min(3, s + 0.2))} className="hover:text-[#D02020]">
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>
          <button onClick={onClose} className="hover:text-[#D02020] transition-colors bg-white/50 p-2 border-2 border-transparent hover:border-black rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* PDF Container */}
      <div className="flex-grow overflow-auto relative flex justify-center bg-[#121212] py-8">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-[#F0C020] font-black text-xl animate-pulse z-20">
            <Loader2 className="w-8 h-8 animate-spin mr-3" />
            Loading Preview...
          </div>
        )}

        {!loading && (
          <div className="relative inline-block shadow-2xl bg-white border-4 border-black transition-all">
            <canvas ref={canvasRef} className="block" />

            {/* Watermark Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-[0.06] overflow-hidden mix-blend-multiply z-10">
              <div className="rotate-[-45deg] text-black font-black text-4xl md:text-6xl whitespace-nowrap">
                SWAPNAOURAN PROKASHON
              </div>
              <div className="rotate-[-45deg] text-black font-black text-2xl md:text-4xl mt-32 whitespace-nowrap">
                PREVIEW COPY
              </div>
            </div>

            {/* Transparent blocker */}
            <div className="absolute inset-0 z-20" />

            {isLastPreviewPage && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-30">
                <div className="bg-white border-4 border-black p-8 max-w-sm mx-4 text-center rounded-xl pointer-events-auto">
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
        )}
      </div>

      {/* Footer Navigation */}
      <div className="bg-white border-t-4 border-black p-4 flex flex-col sm:flex-row items-center justify-between gap-4 z-10 shrink-0">
        <div className="flex items-center gap-8 w-full sm:w-auto justify-center">
          <button
            disabled={pageNum <= 1}
            onClick={() => setPageNum((p) => Math.max(1, p - 1))}
            className="flex items-center gap-2 font-black uppercase tracking-widest text-[#D02020] hover:text-[#1040C0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-6 h-6" /> Previous
          </button>
          <div className="font-black text-lg min-w-[120px] text-center">
            {maxPage > 0 ? `Page ${pageNum} of ${maxPage}` : '--'}
          </div>
          <button
            disabled={pageNum >= maxPage}
            onClick={() => setPageNum((p) => Math.min(maxPage, p + 1))}
            className="flex items-center gap-2 font-black uppercase tracking-widest text-[#1040C0] hover:text-[#D02020] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {price !== undefined && bookId && !showCta && (
          <button
            onClick={() => setShowCta(true)}
            className="w-full sm:w-auto bg-[#D02020] text-white font-black py-2.5 px-6 border-2 border-black hover:bg-black hover:text-[#F0C020] transition-all uppercase tracking-wider text-sm flex items-center justify-center gap-2 rounded-lg"
          >
            <ShoppingCart className="w-4 h-4" />
            Buy to Read Full Book
          </button>
        )}
      </div>
    </div>
  );
}
