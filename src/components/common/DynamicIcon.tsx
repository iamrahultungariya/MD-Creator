import React, { forwardRef } from 'react';
import type { LucideProps } from 'lucide-react';
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  ChevronDown,
  CheckSquare,
  List,
  ListOrdered,
  Quote,
  Minus,
  Code2,
  Table,
  Calculator,
  Sparkles,
  Columns,
  AlignLeft,
  Search,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link,
  Shield,
  Key,
  MapPin,
  Info,
  Lightbulb,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  Image,
  FileDown,
  Download,
  Command,
} from 'lucide-react';

export type IconName = string;

export interface DynamicIconProps extends Omit<LucideProps, 'ref'> {
  name: IconName;
  fallback?: React.ReactNode;
}

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  'heading-1': Heading1,
  'heading-2': Heading2,
  'heading-3': Heading3,
  'heading-4': Heading4,
  'chevron-down': ChevronDown,
  'check-square': CheckSquare,
  'list': List,
  'list-ordered': ListOrdered,
  'quote': Quote,
  'minus': Minus,
  'code-2': Code2,
  'table': Table,
  'calculator': Calculator,
  'sparkles': Sparkles,
  'split': Columns,
  'columns': Columns,
  'align-left': AlignLeft,
  'search': Search,
  'bold': Bold,
  'italic': Italic,
  'strikethrough': Strikethrough,
  'code': Code,
  'link': Link,
  'shield': Shield,
  'key': Key,
  'map-pin': MapPin,
  'info': Info,
  'lightbulb': Lightbulb,
  'alert-circle': AlertCircle,
  'alert-triangle': AlertTriangle,
  'shield-alert': ShieldAlert,
  'image': Image,
  'file-down': FileDown,
  'download': Download,
  'command': Command,
};

/**
 * High-performance Dynamic Lucide Icon component.
 * Maps slash commands and dynamic UI items to tree-shaken static icon components.
 */
export const DynamicIcon = forwardRef<SVGSVGElement, DynamicIconProps>(
  ({ name, fallback = null, ...props }, ref) => {
    const normalizedName = name
      .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2')
      .toLowerCase()
      .replace(/^-/, '');

    const IconComponent = ICON_MAP[normalizedName] || Command;

    return <IconComponent ref={ref} {...props} />;
  }
);

DynamicIcon.displayName = 'DynamicIcon';
