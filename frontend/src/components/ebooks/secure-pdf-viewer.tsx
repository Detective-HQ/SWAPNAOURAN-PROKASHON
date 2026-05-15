'use client';

import { useState, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Loader2 } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Use CDN worker to avoid Webpack bundling issues
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface SecurePdfViewerProps {
  url: string;
  title: string;
  onClose: () => void;
}

export function SecurePdfViewer({ url, title, onClose }: SecurePdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'a', 's', 'p', 'u'].includes(e.key.toLowerCase())) {
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

  const previousPage = () => setPageNumber((p) => Math.max(1, p - 1));
  const nextPage = () => setPageNumber((p) => Math.min(numPages, p + 1));

  return (
    <div
      className="fixed inset-0 z-[100] bg-black flex flex-col select-none"
      style={{ userSelect: 'none' }}
      onCopy={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Header */}
      <div className="bg-[#1040C0] text-white p-4 flex items-center justify-between border-b-4 border-black relative z-10">
        <h2 className="text-xl font-black uppercase tracking-widest truncate max-w-[60%]">{title}</h2>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-black/20 rounded-lg px-4 py-1 border-2 border-black">
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
      <div className="flex-grow overflow-auto relative flex justify-center bg-[#121212] pt-8 pb-20">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-[#F0C020] font-black text-xl animate-pulse z-20">
            <Loader2 className="w-8 h-8 animate-spin mr-3" />
            Loading E-Book...
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
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="bg-white"
            />
          </Document>

          {/* Watermark */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-[0.04] overflow-hidden z-10">
            <div className="rotate-[-45deg] text-black font-black text-6xl md:text-8xl whitespace-nowrap">
              SOPNOURAN PUBLICATION
            </div>
            <div className="rotate-[-45deg] text-black font-black text-2xl mt-32 whitespace-nowrap">
              SOPNOURAN PUBLICATION
            </div>
          </div>

          {/* Interaction blocker */}
          <div className="absolute inset-0 z-20" />
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-white border-t-4 border-black p-4 flex items-center justify-center gap-8 fixed bottom-0 left-0 right-0 z-10">
        <button
          disabled={pageNumber <= 1}
          onClick={previousPage}
          className="flex items-center gap-2 font-black uppercase tracking-widest text-[#D02020] hover:text-[#1040C0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-6 h-6" /> Previous
        </button>
        <div className="font-black text-lg">
          Page {pageNumber} of {numPages || '--'}
        </div>
        <button
          disabled={pageNumber >= numPages}
          onClick={nextPage}
          className="flex items-center gap-2 font-black uppercase tracking-widest text-[#1040C0] hover:text-[#D02020] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
