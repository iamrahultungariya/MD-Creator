import React, { Suspense, forwardRef } from 'react';
import { DynamicIcon as LucideDynamicIcon, type IconName } from 'lucide-react/dynamic';
import type { LucideProps } from 'lucide-react';

export type { IconName };

export interface DynamicIconProps extends Omit<LucideProps, 'ref'> {
  name: IconName | string;
  fallback?: React.ReactNode;
}

/**
 * High-performance Dynamic Lucide Icon component.
 * Lazily loads SVG vector icon nodes on-demand using Vite code-splitting.
 * Accepts both kebab-case ('arrow-right') and PascalCase ('ArrowRight') icon names.
 */
export const DynamicIcon = forwardRef<SVGSVGElement, DynamicIconProps>(
  ({ name, fallback = null, ...props }, ref) => {
    // Normalize name from PascalCase or camelCase to kebab-case
    const normalizedName = (
      name
        .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2')
        .toLowerCase()
        .replace(/^-/, '')
    ) as IconName;

    return (
      <Suspense fallback={fallback}>
        <LucideDynamicIcon ref={ref} name={normalizedName} {...props} />
      </Suspense>
    );
  }
);

DynamicIcon.displayName = 'DynamicIcon';
