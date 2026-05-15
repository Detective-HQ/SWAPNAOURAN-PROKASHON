'use client';

import { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Loader2 } from 'lucide-react';

interface SecurePdfViewerProps {
  url: string;
  title: string;
  onClose: () => void;
}

export function SecurePdfViewer({ url, title, onClose }: SecurePdfViewerProps) {
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(100);

  useEffect(() => {
    // Block right-click
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    // Block copy, select-all, save, print shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (['c', 'a', 's', 'p', 'u'].includes(e.key.toLowerCase())) {
          e.preventDefault();
        }
      }
      // Block PrintScreen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
      }
    };

    // Block copy event
    const handleCopy = (e: ClipboardEvent) => e.preventDefault();

    // Block drag
    const handleDragStart = (e: DragEvent) => e.preventDefault();

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  // Use relative URL — Next.js proxy rewrites /api/* to backend
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
      <div className="bg-[#1040C0] text-white p-4 flex items-center justify-between border-b-4 border-black relative z-10">
        <h2 className="text-xl font-black uppercase tracking-widest truncate max-w-[60%]">{title}</h2>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-black/20 rounded-full px-4 py-1 border-2 border-black">
            <button onClick={() => setScale(s => Math.max(50, s - 10))} className="hover:text-[#F0C020]">
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold w-12 text-center">{scale}%</span>
            <button onClick={() => setScale(s => Math.min(200, s + 10))} className="hover:text-[#F0C020]">
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>

          <button onClick={onClose} className="hover:text-[#D02020] transition-colors bg-white/10 p-2 border-2 border-transparent hover:border-black rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* PDF Container */}
      <div className="flex-grow relative bg-[#121212] overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-[#F0C020] font-black text-xl animate-pulse z-30">
            <Loader2 className="w-8 h-8 animate-spin mr-3" />
            Loading E-Book...
          </div>
        )}

        <div className="w-full h-full flex justify-center overflow-auto">
          <div style={{ width: `${scale}%`, height: '100%', minWidth: '400px' }} className="relative">
            <iframe
              src={pdfSrc}
              className="w-full h-full border-0"
              onLoad={() => setLoading(false)}
              title={`Reading: ${title}`}
              sandbox="allow-same-origin allow-scripts"
            />
            {/* Transparent overlay to block text selection inside the iframe */}
            <div className="absolute inset-0 z-10" style={{ pointerEvents: 'auto', cursor: 'default' }} />
          </div>
        </div>

        {/* Watermark Overlay */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-[0.04] overflow-hidden z-20">
          <div className="rotate-[-45deg] text-white font-black text-6xl md:text-8xl whitespace-nowrap px-20">
            SOPNOURAN PUBLICATION
          </div>
          <div className="rotate-[-45deg] text-white font-black text-2xl mt-32 whitespace-nowrap px-20">
            SOPNOURAN PUBLICATION
          </div>
        </div>
      </div>
    </div>
  );
}
