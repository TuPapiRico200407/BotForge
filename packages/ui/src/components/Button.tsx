import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    // Basic tailwind classes placeholder for UI kit
    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";
    
    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variant === 'primary' ? 'bg-primary text-white hover:bg-primary/90' : ''} ${className || ''}`}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
