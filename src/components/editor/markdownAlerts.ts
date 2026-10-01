import React from 'react';
import { 
  Info, 
  Lightbulb, 
  AlertTriangle, 
  Sparkles, 
  ShieldAlert 
} from 'lucide-react';

// Helper to recursively extract plain text from React elements/AST
export const extractTextFromReactNode = (node: React.ReactNode): string => {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractTextFromReactNode).join('');
  }
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    return props?.children ? extractTextFromReactNode(props.children) : '';
  }
  return '';
};

// Convert heading plain text to slug for outline jump synchronization
export const toHeadingSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
};

export interface AlertCalloutConfig {
  type: 'note' | 'tip' | 'warning' | 'important' | 'caution';
  title: string;
  icon: React.ElementType;
  borderColor: string;
  backgroundColor: string;
  darkBackgroundColor: string;
  badgeBg: string;
  badgeColor: string;
  containerClass: string;
  badgeClass: string;
  titleClass: string;
  iconClass: string;
}

export const ALERT_CONFIGS: Record<string, AlertCalloutConfig> = {
  note: {
    type: 'note',
    title: 'Note',
    icon: Info,
    borderColor: '#8257F5',
    backgroundColor: 'rgba(130, 87, 245, 0.08)',
    darkBackgroundColor: 'rgba(47, 26, 99, 0.25)',
    badgeBg: 'rgba(130, 87, 245, 0.15)',
    badgeColor: '#6D3FE0',
    containerClass: 'bg-brand-50/80 dark:bg-brand-950/40 text-brand-950 dark:text-brand-100 border-l-4 border-l-brand-600 dark:border-l-brand-500',
    badgeClass: 'bg-brand-100 text-brand-800 dark:bg-brand-900/60 dark:text-brand-300 border border-brand-200 dark:border-brand-700/80',
    titleClass: 'text-brand-800 dark:text-brand-300 font-bold',
    iconClass: 'text-brand-600 dark:text-brand-400'
  },
  tip: {
    type: 'tip',
    title: 'Tip',
    icon: Lightbulb,
    borderColor: '#059669',
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
    darkBackgroundColor: 'rgba(6, 78, 59, 0.25)',
    badgeBg: 'rgba(5, 150, 105, 0.15)',
    badgeColor: '#047857',
    containerClass: 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 border-l-4 border-l-emerald-600 dark:border-l-emerald-500',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/80',
    titleClass: 'text-emerald-800 dark:text-emerald-300 font-bold',
    iconClass: 'text-emerald-600 dark:text-emerald-400'
  },
  warning: {
    type: 'warning',
    title: 'Warning',
    icon: AlertTriangle,
    borderColor: '#d97706',
    backgroundColor: 'rgba(217, 119, 6, 0.08)',
    darkBackgroundColor: 'rgba(120, 53, 15, 0.25)',
    badgeBg: 'rgba(217, 119, 6, 0.15)',
    badgeColor: '#b45309',
    containerClass: 'bg-amber-50/80 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100 border-l-4 border-l-amber-600 dark:border-l-amber-500',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-200 dark:border-amber-700/80',
    titleClass: 'text-amber-800 dark:text-amber-300 font-bold',
    iconClass: 'text-amber-600 dark:text-amber-400'
  },
  important: {
    type: 'important',
    title: 'Important',
    icon: Sparkles,
    borderColor: '#7c3aed',
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    darkBackgroundColor: 'rgba(76, 29, 149, 0.25)',
    badgeBg: 'rgba(124, 58, 237, 0.15)',
    badgeColor: '#6d28d9',
    containerClass: 'bg-purple-50/80 dark:bg-purple-950/40 text-purple-950 dark:text-purple-100 border-l-4 border-l-purple-600 dark:border-l-purple-500',
    badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300 border border-purple-200 dark:border-purple-700/80',
    titleClass: 'text-purple-800 dark:text-purple-300 font-bold',
    iconClass: 'text-purple-600 dark:text-purple-400'
  },
  caution: {
    type: 'caution',
    title: 'Caution',
    icon: ShieldAlert,
    borderColor: '#e11d48',
    backgroundColor: 'rgba(225, 29, 72, 0.08)',
    darkBackgroundColor: 'rgba(136, 19, 55, 0.25)',
    badgeBg: 'rgba(225, 29, 72, 0.15)',
    badgeColor: '#be123c',
    containerClass: 'bg-rose-50/80 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100 border-l-4 border-l-rose-600 dark:border-l-rose-500',
    badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 border border-rose-200 dark:border-rose-700/80',
    titleClass: 'text-rose-800 dark:text-rose-300 font-bold',
    iconClass: 'text-rose-600 dark:text-rose-400'
  }
};

/**
 * Strips only the leading [!ALERT] marker from child nodes, keeping all other elements (kbd, strong, em, links) intact.
 */
const stripLeadingAlertMarker = (node: React.ReactNode): { strippedNode: React.ReactNode; success: boolean } => {
  if (typeof node === 'string') {
    const match = node.match(/^(\s*)\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\][ \t]*(?:\r?\n)?/i);
    if (match) {
      const rest = node.slice(match[0].length);
      return { strippedNode: rest.length > 0 ? rest : null, success: true };
    }
    return { strippedNode: node, success: false };
  }

  if (Array.isArray(node)) {
    let handled = false;
    const newChildren: React.ReactNode[] = [];
    for (const child of node) {
      if (!handled) {
        const res = stripLeadingAlertMarker(child);
        if (res.success) {
          handled = true;
          if (res.strippedNode !== null) {
            newChildren.push(res.strippedNode);
          }
          continue;
        }
      } else if (newChildren.length === 0) {
        // Skip leading <br /> or empty whitespace immediately following the stripped alert badge
        if (React.isValidElement(child) && (child.type === 'br' || (child.props as any)?.mdxType === 'br')) {
          continue;
        }
        if (typeof child === 'string' && child.trim().length === 0) {
          continue;
        }
      }
      newChildren.push(child);
    }
    return { strippedNode: newChildren, success: handled };
  }

  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    if (props && 'children' in props) {
      const res = stripLeadingAlertMarker(props.children);
      if (res.success) {
        return {
          strippedNode: React.cloneElement(node as React.ReactElement<any>, {
            children: res.strippedNode,
          }),
          success: true,
        };
      }
    }
  }

  return { strippedNode: node, success: false };
};

/**
 * Inspects blockquote children to find [!NOTE], [!TIP], [!WARNING], [!IMPORTANT], [!CAUTION]
 * Tolerates leading whitespace, newlines, and nested elements.
 */
export const extractAlertInfo = (children: React.ReactNode): { config: AlertCalloutConfig; content: React.ReactNode } | null => {
  const childrenArray = React.Children.toArray(children);
  if (childrenArray.length === 0) return null;

  // Find the first meaningful child (skipping empty whitespace / newlines)
  let targetChildIndex = -1;
  for (let i = 0; i < childrenArray.length; i++) {
    const c = childrenArray[i];
    if (React.isValidElement(c)) {
      targetChildIndex = i;
      break;
    }
    if (typeof c === 'string' && c.trim().length > 0) {
      targetChildIndex = i;
      break;
    }
  }

  if (targetChildIndex === -1) return null;

  const targetChild = childrenArray[targetChildIndex];
  const innerText = React.isValidElement(targetChild)
    ? extractTextFromReactNode((targetChild.props as any)?.children).trimStart()
    : String(targetChild).trimStart();

  const match = innerText.match(/^\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]/i);
  if (!match) return null;

  const alertType = match[1].toLowerCase();
  const config = ALERT_CONFIGS[alertType];
  if (!config) return null;

  // Strip only the alert marker while fully preserving child tags (<kbd>, <strong>, etc.)
  const { strippedNode } = stripLeadingAlertMarker(targetChild);

  const remainingChildren = [
    ...childrenArray.slice(0, targetChildIndex),
    strippedNode,
    ...childrenArray.slice(targetChildIndex + 1)
  ].filter(Boolean);

  return { config, content: remainingChildren };
};

export const getAlertThemeClasses = (config: AlertCalloutConfig, forceTheme?: 'light' | 'dark') => {
  if (forceTheme === 'light') {
    switch (config.type) {
      case 'note':
        return {
          container: 'bg-brand-50/90 text-brand-950 border-l-4 border-l-brand-600 border-y border-r border-brand-200/50',
          badge: 'bg-brand-100 text-brand-800 border border-brand-200',
          icon: 'text-brand-600',
        };
      case 'tip':
        return {
          container: 'bg-emerald-50/90 text-emerald-950 border-l-4 border-l-emerald-600 border-y border-r border-emerald-200/50',
          badge: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
          icon: 'text-emerald-600',
        };
      case 'warning':
        return {
          container: 'bg-amber-50/90 text-amber-950 border-l-4 border-l-amber-600 border-y border-r border-amber-200/50',
          badge: 'bg-amber-100 text-amber-800 border border-amber-200',
          icon: 'text-amber-600',
        };
      case 'important':
        return {
          container: 'bg-purple-50/90 text-purple-950 border-l-4 border-l-purple-600 border-y border-r border-purple-200/50',
          badge: 'bg-purple-100 text-purple-800 border border-purple-200',
          icon: 'text-purple-600',
        };
      case 'caution':
        return {
          container: 'bg-rose-50/90 text-rose-950 border-l-4 border-l-rose-600 border-y border-r border-rose-200/50',
          badge: 'bg-rose-100 text-rose-800 border border-rose-200',
          icon: 'text-rose-600',
        };
    }
  } else if (forceTheme === 'dark') {
    switch (config.type) {
      case 'note':
        return {
          container: 'bg-brand-950/40 text-brand-100 border-l-4 border-l-brand-500 border-y border-r border-brand-800/50',
          badge: 'bg-brand-900/60 text-brand-300 border border-brand-700/80',
          icon: 'text-brand-400',
        };
      case 'tip':
        return {
          container: 'bg-emerald-950/40 text-emerald-100 border-l-4 border-l-emerald-500 border-y border-r border-emerald-800/50',
          badge: 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/80',
          icon: 'text-emerald-400',
        };
      case 'warning':
        return {
          container: 'bg-amber-950/40 text-amber-100 border-l-4 border-l-amber-500 border-y border-r border-amber-800/50',
          badge: 'bg-amber-900/60 text-amber-300 border border-amber-700/80',
          icon: 'text-amber-400',
        };
      case 'important':
        return {
          container: 'bg-purple-950/40 text-purple-100 border-l-4 border-l-purple-500 border-y border-r border-purple-800/50',
          badge: 'bg-purple-900/60 text-purple-300 border border-purple-700/80',
          icon: 'text-purple-400',
        };
      case 'caution':
        return {
          container: 'bg-rose-950/40 text-rose-100 border-l-4 border-l-rose-500 border-y border-r border-rose-800/50',
          badge: 'bg-rose-900/60 text-rose-300 border border-rose-700/80',
          icon: 'text-rose-400',
        };
    }
  }

  // Standard responsive with dark: classes
  return {
    container: `${config.containerClass} border-y border-r border-neutral-200/50 dark:border-neutral-800/50`,
    badge: config.badgeClass,
    icon: config.iconClass,
  };
};

