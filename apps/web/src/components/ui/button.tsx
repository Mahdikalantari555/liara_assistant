import * as React from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'default' | 'outline' | 'ghost';
export type ButtonSize = 'default' | 'sm' | 'icon';

const variants: Record<ButtonVariant, string> = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  outline: 'border border-border bg-transparent hover:bg-muted',
  ghost: 'hover:bg-muted',
};

const sizes: Record<ButtonSize, string> = {
  default: 'h-9 px-4',
  sm: 'h-8 px-3 text-xs',
  icon: 'h-9 w-9',
};

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }
>(({ className, variant = 'default', size = 'default', type, ...props }, ref) => (
  <button
    ref={ref}
    type={type ?? 'button'}
    className={cn(
      'inline-flex items-center justify-center gap-1.5 rounded-md text-body font-medium whitespace-nowrap',
      'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
      'disabled:pointer-events-none disabled:opacity-40',
      variants[variant],
      sizes[size],
      className,
    )}
    {...props}
  />
));
Button.displayName = 'Button';

export { Button };
