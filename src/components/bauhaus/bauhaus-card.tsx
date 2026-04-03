import React from 'react';
import { cn } from '@/lib/utils';

interface BauhausCardProps extends React.HTMLAttributes<HTMLDivElement> {
  decorationColor?: 'red' | 'blue' | 'yellow' | 'sage' | 'terracotta';
  variant?: 'white' | 'clay' | 'forest';
}

export const BauhausCard = React.forwardRef<HTMLDivElement, BauhausCardProps>(
  ({ children, className, variant = 'white', ...props }, ref) => {
    const variants = {
      white: 'bg-white',
      clay: 'bg-[#DCCFC2]',
      forest: 'bg-[#2D3A31] text-white',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-[32px] organic-shadow-lg p-8 group transition-all duration-500 hover:-translate-y-2',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
BauhausCard.displayName = 'BauhausCard';
