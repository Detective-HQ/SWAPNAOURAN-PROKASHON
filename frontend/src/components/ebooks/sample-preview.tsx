import { useState } from 'react';
import { X, Loader2, BookOpen } from 'lucide-react';

interface SamplePreviewProps {
  url: string;
  title: string;
  onClose: () => void;
}

export function SamplePreview({ url, title, onClose }: SamplePreviewProps) {
  const [loading, setLoading] = useState(true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-botanical-terracotta" />
            <h3 className="font-headline font-bold text-botanical-forest text-lg">
              Sample: <span className="italic font-normal">{title}</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-botanical-clay/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto bg-botanical-alabaster/50 relative min-h-[500px]">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-botanical-terracotta" />
            </div>
          )}
          <iframe
            src={url}
            className="w-full h-full min-h-[500px]"
            title={`Sample: ${title}`}
            onLoad={() => setLoading(false)}
          />
        </div>
      </div>
    </div>
  );
}
