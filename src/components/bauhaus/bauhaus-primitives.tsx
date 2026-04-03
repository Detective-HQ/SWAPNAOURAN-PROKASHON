import React from 'react';
import { cn } from '@/lib/utils';

interface BauhausButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'red' | 'blue' | 'yellow' | 'outline' | 'black';
  shape?: 'square' | 'pill';
  size?: 'sm' | 'md' | 'lg';
}

export const BauhausButton = React.forwardRef<HTMLButtonElement, BauhausButtonProps>(
  ({ className, variant = 'red', shape = 'square', size = 'md', ...props }, ref) => {
    const variants = {
      red: 'bg-[#D02020] text-white hover:bg-[#D02020]/90',
      blue: 'bg-[#1040C0] text-white hover:bg-[#1040C0]/90',
      yellow: 'bg-[#F0C020] text-black hover:bg-[#F0C020]/90',
      outline: 'bg-white text-black hover:bg-muted border-black',
      black: 'bg-[#121212] text-white hover:bg-[#121212]/90',
    };

    const sizes = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-6 py-3 text-sm',
      lg: 'px-10 py-5 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'bauhaus-btn-press border-2 md:border-4 border-[#121212] bauhaus-shadow-sm font-black uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2',
          variants[variant],
          sizes[size],
          shape === 'square' ? 'rounded-none' : 'rounded-full',
          className
        )}
        {...props}
      />
    );
  }
);
BauhausButton.displayName = 'BauhausButton';

export const GeometricShape = ({ 
  type, 
  color = 'red', 
  className 
}: { 
  type: 'circle' | 'square' | 'triangle', 
  color?: 'red' | 'blue' | 'yellow' | 'black' | 'white',
  className?: string
}) => {
  const colors = {
    red: 'bg-[#D02020]',
    blue: 'bg-[#1040C0]',
    yellow: 'bg-[#F0C020]',
    black: 'bg-[#121212]',
    white: 'bg-white',
  };

  if (type === 'triangle') {
    const triangleColors = {
      red: 'border-b-[#D02020]',
      blue: 'border-b-[#1040C0]',
      yellow: 'border-b-[#F0C020]',
      black: 'border-b-[#121212]',
      white: 'border-b-white',
    };
    return (
      <div 
        className={cn(
          'w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[30px]',
          triangleColors[color],
          className
        )} 
      />
    );
  }

  return (
    <div className={cn(
      'w-8 h-8',
      type === 'circle' ? 'rounded-full' : 'rounded-none',
      colors[color],
      className
    )} />
  );
};

export const SectionDivider = ({ className }: { className?: string }) => (
  <div className={cn("border-b-4 border-black w-full", className)} />
);
