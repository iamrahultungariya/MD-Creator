import React from 'react';

interface BuyMeCoffeeButtonProps {
  slug?: string;
  text?: string;
  variant?: 'official' | 'compact' | 'pill' | 'outline';
  className?: string;
}

export const BMC_SLUG = 'Sponoora';
export const BMC_URL = `https://buymeacoffee.com/${BMC_SLUG}`;

/**
 * Official Buy Me a Coffee SVG Logo with white cup & black outline
 */
export const BmcCoffeeCupIcon: React.FC<{ className?: string; size?: number }> = ({ 
  className = 'w-5 h-5', 
  size 
}) => (
  <svg
    viewBox="0 0 1000 1000"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
  >
    {/* Steam / Aroma */}
    <path
      d="M386 195c-15-28-11-64 12-88 28-30 76-32 107-5 31 27 34 74 7 104-18 20-46 27-72 20-22-6-41-17-54-31z"
      fill="#000000"
    />
    <path
      d="M602 195c-15-28-11-64 12-88 28-30 76-32 107-5 31 27 34 74 7 104-18 20-46 27-72 20-22-6-41-17-54-31z"
      fill="#000000"
    />
    {/* Cup Body with Outline */}
    <path
      d="M172 344h656c0 0 6 138-70 238-66 88-180 128-258 128s-192-40-258-128c-76-100-70-238-70-238z"
      fill="#ffffff"
      stroke="#000000"
      strokeWidth="48"
      strokeMiterlimit="10"
    />
    {/* Cup Handle */}
    <path
      d="M758 392c68 0 122 54 122 122 0 68-54 122-122 122"
      stroke="#000000"
      strokeWidth="48"
      strokeMiterlimit="10"
      strokeLinecap="round"
    />
    {/* Saucer */}
    <path
      d="M200 780h600"
      stroke="#000000"
      strokeWidth="48"
      strokeMiterlimit="10"
      strokeLinecap="round"
    />
  </svg>
);

export const BuyMeCoffeeButton: React.FC<BuyMeCoffeeButtonProps> = ({
  slug = BMC_SLUG,
  text = 'Buy me a coffee',
  variant = 'official',
  className = ''
}) => {
  const url = `https://buymeacoffee.com/${slug}`;

  if (variant === 'compact') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className={`inline-flex items-center justify-center p-2 rounded-full bg-[#FFDD00] hover:bg-[#ffe633] text-neutral-950 border border-black/15 shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer ${className}`}
        title={`${text} (${slug})`}
      >
        <BmcCoffeeCupIcon className="w-4 h-4" />
      </a>
    );
  }

  if (variant === 'pill') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFDD00] hover:bg-[#ffe633] text-neutral-950 font-bold text-xs border border-black/15 shadow-xs hover:shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer ${className}`}
        title={`${text} (${slug})`}
      >
        <BmcCoffeeCupIcon className="w-4 h-4" />
        <span>{text}</span>
      </a>
    );
  }

  if (variant === 'outline') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#FFDD00] bg-[#FFDD00]/10 hover:bg-[#FFDD00] text-neutral-900 dark:text-white hover:text-neutral-950 font-bold text-xs transition-all hover:scale-105 active:scale-95 cursor-pointer ${className}`}
        title={`${text} (${slug})`}
      >
        <BmcCoffeeCupIcon className="w-4 h-4" />
        <span>{text}</span>
      </a>
    );
  }

  // Official Button Variant (Yellow #FFDD00, Comic/Bold font, Black border)
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-[#FFDD00] hover:bg-[#ffe633] text-black font-extrabold text-sm border border-neutral-900/20 shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 select-none cursor-pointer tracking-tight font-sans ${className}`}
      title={`${text} on Buy Me a Coffee`}
    >
      <BmcCoffeeCupIcon className="w-5 h-5 shrink-0" />
      <span>{text}</span>
    </a>
  );
};
