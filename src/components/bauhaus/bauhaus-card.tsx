import React from 'react';
import { cn } from '@/lib/utils';

interface BauhausCardProps extends React.HTMLAttributes<HTMLDivElement> {
  decorationColor?: 'red' | 'blue' | 'yellow';
  decorationShape?: 'circle' | 'square' | 'triangle';
}

export const BauhausCard = React.forwardRef<HTMLDivElement, BauhausCardProps>(
  ({ children, className, decorationColor = 'red', decorationShape = 'square', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative bg-white border-4 border-[#121212] bauhaus-shadow-lg p-6 group transition-transform hover:-translate-y-2',
          className
        )}
        {...props}
      >
        <div className="absolute top-2 right-2">
           {decorationShape === 'circle' && <div className={cn("w-3 h-3 rounded-full", decorationColor === 'red' ? 'bg-[#D02020]' : decorationColor === 'blue' ? 'bg-[#1040C0]' : 'bg-[#F0C020]')} />}
           {decorationShape === 'square' && <div className={cn("w-3 h-3", decorationColor === 'red' ? 'bg-[#D02020]' : decorationColor === 'blue' ? 'bg-[#1040C0]' : 'bg-[#F0C020]')} />}
           {decorationShape === 'triangle' && <div className={cn("w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px]", decorationColor === 'red' ? 'border-b-[#D02020]' : decorationColor === 'blue' ? 'border-b-[#1040C0]' : 'border-b-[#F0C020]')} />}
        </div>
        {children}
      </div>
    );
  }
);
BauhausCard.displayName = 'BauhausCard';
