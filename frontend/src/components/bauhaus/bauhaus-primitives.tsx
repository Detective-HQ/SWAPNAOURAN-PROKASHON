import React from 'react';
import { cn } from '@/lib/utils';

interface BauhausButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'terracotta' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const BauhausButton = React.forwardRef<HTMLButtonElement, BauhausButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-[#2D3A31] text-white hover:bg-[#3d4d42]',
      secondary: 'bg-[#8C9A84] text-white hover:bg-[#7a8873]',
      terracotta: 'bg-[#C27B66] text-white hover:bg-[#b06a56]',
      outline: 'bg-transparent text-[#2D3A31] border border-[#2D3A31] hover:bg-[#2D3A31] hover:text-white',
      ghost: 'bg-transparent text-[#2D3A31] hover:bg-[#2D3A31]/5',
    };

    const sizes = {
      sm: 'px-6 py-2 text-xs',
      md: 'px-8 py-3.5 text-sm',
      lg: 'px-12 py-5 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'rounded-full font-semibold uppercase tracking-widest transition-all duration-300 inline-flex items-center justify-center gap-2 active:scale-95',
          variants[variant],
          sizes[size],
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
  color = 'sage', 
  className 
}: { 
  type: 'circle' | 'square' | 'triangle' | 'arch', 
  color?: 'sage' | 'clay' | 'terracotta' | 'forest' | 'white',
  className?: string
}) => {
  const colors = {
    sage: 'bg-[#8C9A84]',
    clay: 'bg-[#DCCFC2]',
    terracotta: 'bg-[#C27B66]',
    forest: 'bg-[#2D3A31]',
    white: 'bg-white',
  };

  if (type === 'arch') {
    return (
      <div className={cn('rounded-t-full', colors[color], className)} />
    );
  }

  return (
    <div className={cn(
      'w-8 h-8',
      type === 'circle' ? 'rounded-full' : type === 'triangle' ? 'clip-path-triangle' : 'rounded-2xl',
      colors[color],
      className
    )} />
  );
};

export const SectionDivider = ({ className }: { className?: string }) => (
  <div className={cn("h-px bg-border w-full my-12", className)} />
);
