'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface SecurePdfViewerProps {
  url: string;
  title: string;
  onClose: () => void;
}

export function SecurePdfViewer({ url, title, onClose }: SecurePdfViewerProps) {
  const [loading, setLoading] = useState(true);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="bg-[#1040C0] text-white p-4 flex items-center justify-between border-b-4 border-black relative z-10">
        <h2 className="text-xl font-black uppercase tracking-widest truncate max-w-[80%]">{title}</h2>
        <button onClick={onClose} className="hover:text-[#D02020] transition-colors bg-white/10 p-2 border-2 border-transparent hover:border-black rounded-lg">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-grow relative bg-[#121212]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-[#F0C020] font-black text-xl animate-pulse z-20">
            <Loader2 className="w-8 h-8 animate-spin mr-3" />
            Loading E-Book...
          </div>
        )}
        <iframe
          src={url}
          className="w-full h-full"
          title={title}
          onLoad={() => setLoading(false)}
        />
      </div>
    </div>
  );
}
