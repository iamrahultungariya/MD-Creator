import React, { forwardRef } from 'react';

export type CardVariant = 'surface' | 'elevated' | 'interactive' | 'minimal';
export type CardPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
}

const variantStyles: Record<CardVariant, string> = {
  surface: 'card-surface',
  elevated: 'card-elevated',
  interactive: 'card-interactive',
  minimal: 'card-minimal',
};

const paddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  xs: 'p-2 sm:p-3',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
  xl: 'p-8 sm:p-10',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'surface', padding = 'md', className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
