import React from 'react';

// Open-Source 3D & Vector Visual Icon Engine (MIT / CC-BY 4.0 Licensed)
// High-DPI cross-platform rendering for unicode symbols, badges, and pictograms

const SHORTCODE_MAP: Record<string, string> = {
  rocket: '1f680',
  fire: '1f525',
  sparkles: '2728',
  heart: '2764-fe0f',
  star: '2b50',
  check: '2705',
  zap: '26a1',
  bulb: '1f4a1',
  memo: '1f4dd',
  book: '1f4d6',
  apple: '1f34e',
  smile: '1f604',
  laugh: '1f602',
  wave: '1f44b',
  eyes: '1f440',
  tada: '1f389',
  party: '1f389',
  gear: '2699-fe0f',
  lock: '1f512',
  key: '1f511',
  warning: '26a0-fe0f',
  info: '2139-fe0f',
  pin: '1f4cc',
  link: '1f517',
  laptop: '1f4bb',
  phone: '1f4f1',
  calendar: '1f4c5',
  folder: '1f4c1',
  trash: '1f5d1-fe0f',
  art: '1f3a8',
  pencil: '270f-fe0f',
};

// Curated 3D Microsoft Fluent open-source asset map (MIT Licensed)
const FLUENT_3D_ASSET_MAP: Record<string, string> = {
  '1f680': 'Rocket/3D/rocket_3d.png',
  '1f525': 'Fire/3D/fire_3d.png',
  '2728': 'Sparkles/3D/sparkles_3d.png',
  '2615': 'Hot%20beverage/3D/hot_beverage_3d.png',
  '2764-fe0f': 'Red%20heart/3D/red_heart_3d.png',
  '2764': 'Red%20heart/3D/red_heart_3d.png',
  '2b50': 'Star/3D/star_3d.png',
  '26a1': 'High%20voltage/3D/high_voltage_3d.png',
  '1f4a1': 'Light%20bulb/3D/light_bulb_3d.png',
  '1f4c4': 'Page%20facing%20up/3D/page_facing_up_3d.png',
  '1f4d1': 'Bookmark%20tabs/3D/bookmark_tabs_3d.png',
  '2601-fe0f': 'Cloud/3D/cloud_3d.png',
  '2601': 'Cloud/3D/cloud_3d.png',
  '1f9d8': 'Person%20in%20lotus%20position/Default/3D/person_in_lotus_position_3d_default.png',
  '1f62b': 'Tired%20face/3D/tired_face_3d.png',
  '1f641': 'Slightly%20frowning%20face/3D/slightly_frowning_face_3d.png',
  '1f610': 'Neutral%20face/3D/neutral_face_3d.png',
  '1f60a': 'Smiling%20face%20with%20smiling%20eyes/3D/smiling_face_with_smiling_eyes_3d.png',
  '1f929': 'Star-struck/3D/star-struck_3d.png',
  '1f64c': 'Raising%20hands/Default/3D/raising_hands_3d_default.png',
  '1f3af': 'Bullseye/3D/bullseye_3d.png',
  '23f1-fe0f': 'Stopwatch/3D/stopwatch_3d.png',
  '23f1': 'Stopwatch/3D/stopwatch_3d.png',
  '1f6d2': 'Shopping%20cart/3D/shopping_cart_3d.png',
  '1f373': 'Cooking/3D/cooking_3d.png',
  '1f389': 'Party%20popper/3D/party_popper_3d.png',
  '1f4dd': 'Memo/3D/memo_3d.png',
  '1f512': 'Locked/3D/locked_3d.png',
  '1f4bb': 'Laptop/3D/laptop_3d.png',
  '1f4f1': 'Mobile%20phone/3D/mobile_phone_3d.png',
  '1f4c5': 'Calendar/3D/calendar_3d.png',
  '1f4c1': 'File%20folder/3D/file_folder_3d.png',
  '1f5d1-fe0f': 'Wastebasket/3D/wastebasket_3d.png',
  '1f5d1': 'Wastebasket/3D/wastebasket_3d.png',
  '1f3a8': 'Artist%20palette/3D/artist_palette_3d.png',
  '270f-fe0f': 'Pencil/3D/pencil_3d.png',
  '270f': 'Pencil/3D/pencil_3d.png',
  '2705': 'Check%20mark%20button/3D/check_mark_button_3d.png'
};

// Converts any unicode symbol to hex code string
export function iconToUnified(symbol: string): string {
  const codePoints: string[] = [];
  for (const ch of Array.from(symbol)) {
    const cp = ch.codePointAt(0);
    if (cp) {
      codePoints.push(cp.toString(16).toLowerCase());
    }
  }
  return codePoints.join('-');
}
export const emojiToUnified = iconToUnified;

export function getRichIconUrl(symbolOrShortcode: string): string {
  let unified = '';
  if (symbolOrShortcode.startsWith(':') && symbolOrShortcode.endsWith(':')) {
    const code = symbolOrShortcode.slice(1, -1).toLowerCase();
    unified = SHORTCODE_MAP[code] || '';
  } else {
    unified = iconToUnified(symbolOrShortcode);
  }

  if (!unified) {
    unified = '2728';
  }

  // 1. Try 3D asset if mapped
  const fluentPath = FLUENT_3D_ASSET_MAP[unified] || FLUENT_3D_ASSET_MAP[unified.replace(/-fe0f/g, '')];
  if (fluentPath) {
    return `https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/${fluentPath}`;
  }

  // 2. Open-source vector fallback (CC-BY 4.0 / MIT)
  const cleanHex = unified.replace(/-fe0f/g, '');
  return `https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${cleanHex}.svg`;
}

export const getFluentEmojiUrl = getRichIconUrl;
export const getAppleEmojiUrl = getRichIconUrl;

// Regex matching unicode pictographics, visual symbols, and shortcodes (:rocket:)
export const ICON_REGEX = /(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*|:[a-zA-Z0-9_+-]+:)/gu;
export const EMOJI_REGEX = ICON_REGEX;

export interface RichIconProps {
  icon?: string;
  emoji?: string; // backward compat
  className?: string;
  size?: number | string;
  alt?: string;
}

export const RichIcon: React.FC<RichIconProps> = ({ 
  icon,
  emoji,
  className = '', 
  size = '1.25em',
  alt 
}) => {
  const targetSymbol = icon || emoji || '✨';
  const [hasError, setHasError] = React.useState(false);
  const src = getRichIconUrl(targetSymbol);

  if (hasError) {
    return <span className={`inline-block select-none ${className}`}>{targetSymbol}</span>;
  }

  return (
    <img
      src={src}
      alt={alt || targetSymbol}
      width={typeof size === 'number' ? size : undefined}
      height={typeof size === 'number' ? size : undefined}
      style={typeof size === 'string' ? { width: size, height: size } : undefined}
      loading="lazy"
      decoding="async"
      onError={() => setHasError(true)}
      className={`rich-icon apple-emoji inline-block align-[-0.22em] mx-[0.08em] select-none pointer-events-none drop-shadow-xs ${className}`}
    />
  );
};

// Aliases for backward compatibility
export const FluentEmoji = RichIcon;
export const AppleEmoji = RichIcon;

// Replaces symbols in plain text with RichIcon components
export function renderWithRichIcons(text: string): React.ReactNode {
  if (!text || typeof text !== 'string') return text;

  const parts = text.split(ICON_REGEX);
  if (parts.length <= 1) return text;

  return parts.map((part, index) => {
    if (index % 2 === 1 && part) {
      return <RichIcon key={`icon_${index}_${part}`} icon={part} />;
    }
    return part;
  });
}

export const renderWithFluentEmojis = renderWithRichIcons;
export const renderWithAppleEmojis = renderWithRichIcons;

// Recursively replaces visual symbols in React children
export function replaceRichIconsInReactNode(node: React.ReactNode): React.ReactNode {
  if (typeof node === 'string') {
    return renderWithRichIcons(node);
  }
  if (Array.isArray(node)) {
    return React.Children.map(node, (child) => replaceRichIconsInReactNode(child));
  }
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    if (props && props.children) {
      return React.cloneElement(node as React.ReactElement<any>, {
        children: replaceRichIconsInReactNode(props.children)
      });
    }
  }
  return node;
}

export const replaceEmojisInReactNode = replaceRichIconsInReactNode;
