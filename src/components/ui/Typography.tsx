import React from 'react';

// ============================================================================
// HEADING COMPONENT
// ============================================================================
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span';
}

const headingStyles: Record<HeadingLevel, string> = {
  1: 'text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.035em] leading-[1.15]',
  2: 'text-2xl sm:text-3xl font-bold tracking-tight leading-[1.25]',
  3: 'text-xl sm:text-2xl font-semibold tracking-tight leading-[1.3]',
  4: 'text-lg sm:text-xl font-semibold tracking-snug leading-[1.35]',
  5: 'text-base sm:text-lg font-semibold tracking-snug leading-[1.4]',
  6: 'text-sm sm:text-base font-semibold tracking-normal leading-[1.4]',
};

export const Heading: React.FC<HeadingProps> = ({
  level = 2,
  as,
  className = '',
  children,
  ...props
}) => {
  const Component = (as || `h${level}`) as React.ElementType;

  return (
    <Component
      className={`text-neutral-900 dark:text-neutral-100 ${headingStyles[level]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

// ============================================================================
// TEXT COMPONENT
// ============================================================================
export type TextVariant = 'body' | 'lead' | 'small' | 'muted' | 'mono';

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: TextVariant;
  as?: 'p' | 'span' | 'div' | 'label';
}

const textStyles: Record<TextVariant, string> = {
  body: 'text-sm sm:text-base leading-relaxed text-neutral-800 dark:text-neutral-200',
  lead: 'text-base sm:text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 font-normal',
  small: 'text-xs sm:text-sm leading-normal text-neutral-600 dark:text-neutral-400',
  muted: 'text-xs sm:text-sm leading-normal text-neutral-500 dark:text-neutral-400',
  mono: 'text-xs sm:text-sm font-mono leading-relaxed text-neutral-700 dark:text-neutral-300',
};

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  as = 'p',
  className = '',
  children,
  ...props
}) => {
  const Component = as as React.ElementType;

  return (
    <Component className={`${textStyles[variant]} ${className}`} {...props}>
      {children}
    </Component>
  );
};

// ============================================================================
// LABEL COMPONENT
// ============================================================================
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({
  required,
  className = '',
  children,
  ...props
}) => {
  return (
    <label
      className={`text-xs font-semibold text-neutral-700 dark:text-neutral-300 tracking-tight flex items-center gap-1 select-none ${className}`}
      {...props}
    >
      {children}
      {required && <span className="text-rose-500">*</span>}
    </label>
  );
};
