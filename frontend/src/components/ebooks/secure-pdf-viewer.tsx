'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface SecurePdfViewerProps {
  url: string;
  title: string;
  onClose: () => void;
}

export function SecurePdfViewer({ url, title, onClose }: SecurePdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1.2);

  // Load PDF.js from CDN to completely bypass Webpack/Next.js bundling issues
  useEffect(() => {
    const loadPdfJs = async () => {
      // Create script tag for pdf.js
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

  // Render the page when pageNum, scale, or pdfDoc changes
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
        
        // Handle high DPI displays for sharper text
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
        // Ignore render cancellation errors
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
      if ((e.ctrlKey || e.metaKey) && ['c', 'a', 's', 'p', 'u'].includes(e.key.toLowerCase())) {
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

  const previousPage = () => setPageNum((p) => Math.max(1, p - 1));
  const nextPage = () => setPageNum((p) => Math.min(numPages, p + 1));

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col select-none">
      {/* Header */}
      <div className="bg-[#1040C0] text-white p-4 flex items-center justify-between border-b-4 border-black relative z-10">
        <h2 className="text-xl font-black uppercase tracking-widest truncate max-w-[50%]">{title}</h2>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-black/20 rounded-lg px-4 py-1 border-2 border-black hidden sm:flex">
            <button onClick={() => setScale((s) => Math.max(0.5, s - 0.2))} className="hover:text-[#F0C020]">
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold w-12 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale((s) => Math.min(3, s + 0.2))} className="hover:text-[#F0C020]">
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>
          <button onClick={onClose} className="hover:text-[#D02020] transition-colors bg-white/10 p-2 border-2 border-transparent hover:border-black rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* PDF Container */}
      <div className="flex-grow overflow-auto relative flex justify-center bg-[#121212] py-8">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-[#F0C020] font-black text-xl animate-pulse z-20">
            <Loader2 className="w-8 h-8 animate-spin mr-3" />
            Loading Secure E-Book...
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
                DO NOT DISTRIBUTE
              </div>
            </div>

            {/* Transparent blocker to prevent canvas right-click saving */}
            <div className="absolute inset-0 z-20" />
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="bg-white border-t-4 border-black p-4 flex items-center justify-center gap-8 z-10 shrink-0">
        <button
          disabled={pageNum <= 1}
          onClick={previousPage}
          className="flex items-center gap-2 font-black uppercase tracking-widest text-[#D02020] hover:text-[#1040C0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-6 h-6" /> Previous
        </button>
        <div className="font-black text-lg min-w-[120px] text-center">
          {numPages > 0 ? `Page ${pageNum} of ${numPages}` : '--'}
        </div>
        <button
          disabled={pageNum >= numPages}
          onClick={nextPage}
          className="flex items-center gap-2 font-black uppercase tracking-widest text-[#1040C0] hover:text-[#D02020] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
