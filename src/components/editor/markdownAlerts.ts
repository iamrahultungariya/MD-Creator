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
    borderColor: '#2563eb',
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    darkBackgroundColor: 'rgba(30, 58, 138, 0.25)',
    badgeBg: 'rgba(37, 99, 235, 0.15)',
    badgeColor: '#1d4ed8',
    containerClass: 'callout-alert-note text-blue-950 dark:text-blue-100',
    badgeClass: 'border border-blue-300/80 dark:border-blue-700/60',
    titleClass: 'text-blue-800 dark:text-blue-300 font-bold',
    iconClass: 'text-blue-600 dark:text-blue-400'
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
    containerClass: 'callout-alert-tip text-emerald-950 dark:text-emerald-100',
    badgeClass: 'border border-emerald-300/80 dark:border-emerald-700/60',
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
    containerClass: 'callout-alert-warning text-amber-950 dark:text-amber-100',
    badgeClass: 'border border-amber-300/80 dark:border-amber-700/60',
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
    containerClass: 'callout-alert-important text-purple-950 dark:text-purple-100',
    badgeClass: 'border border-purple-300/80 dark:border-purple-700/60',
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
    containerClass: 'callout-alert-caution text-rose-950 dark:text-rose-100',
    badgeClass: 'border border-rose-300/80 dark:border-rose-700/60',
    titleClass: 'text-rose-800 dark:text-rose-300 font-bold',
    iconClass: 'text-rose-600 dark:text-rose-400'
  }
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

  // Strip "[!NOTE]" prefix from text
  const textWithoutMarker = innerText.replace(/^\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]\s*/i, '');

  let remainingTargetChild: React.ReactNode = null;
  if (textWithoutMarker.length > 0) {
    if (React.isValidElement(targetChild)) {
      remainingTargetChild = React.cloneElement(targetChild as React.ReactElement<any>, {
        children: textWithoutMarker
      });
    } else {
      remainingTargetChild = textWithoutMarker;
    }
  }

  const remainingChildren = [
    ...childrenArray.slice(0, targetChildIndex),
    remainingTargetChild,
    ...childrenArray.slice(targetChildIndex + 1)
  ].filter(Boolean);

  return { config, content: remainingChildren };
};
