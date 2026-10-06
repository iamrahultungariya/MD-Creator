export interface AvatarPreset {
  id: string;
  name: string;
  tagline: string;
  svg: string;
}

// Helper to encode SVG into safe data URI for img src
const encodeSvg = (svg: string): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;

// Bespoke MD Writer Character Avatars (Obsidian, Slate, and Brand-Violet Accents)
export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'scribe',
    name: 'The Scribe',
    tagline: 'Quiet focus & deep essays',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="50" fill="#13111C"/>
      <circle cx="50" cy="42" r="22" fill="#242132"/>
      <path d="M50 20C40 20 32 28 32 38C32 41 33 43 35 45C33 42 35 32 50 32C65 32 67 42 65 45C67 43 68 41 68 38C68 28 60 20 50 20Z" fill="#8257F5"/>
      <path d="M22 88C22 72 34 64 50 64C66 64 78 72 78 88" stroke="#8257F5" stroke-width="4" stroke-linecap="round"/>
      <circle cx="43" cy="42" r="2.5" fill="#FFFFFF"/>
      <circle cx="57" cy="42" r="2.5" fill="#FFFFFF"/>
      <path d="M46 51C48 53 52 53 54 51" stroke="#A78BFA" stroke-width="2" stroke-linecap="round"/>
      <path d="M68 32L78 20L82 24L72 36Z" fill="#A78BFA"/>
      <path d="M78 20L82 16L86 20L82 24Z" fill="#DDD6FE"/>
    </svg>`
  },
  {
    id: 'minimalist',
    name: 'The Minimalist',
    tagline: 'Zero clutter, pure signal',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="50" fill="#0D0F12"/>
      <circle cx="50" cy="42" r="21" fill="#1A1F26"/>
      <path d="M30 36C34 26 44 22 56 24C66 26 70 34 70 38C64 33 55 30 45 32C37 34 32 35 30 36Z" fill="#38BDF8"/>
      <rect x="36" y="38" width="11" height="8" rx="2" stroke="#E2E8F0" stroke-width="2"/>
      <rect x="53" y="38" width="11" height="8" rx="2" stroke="#E2E8F0" stroke-width="2"/>
      <line x1="47" y1="42" x2="53" y2="42" stroke="#E2E8F0" stroke-width="2"/>
      <path d="M47 51C49 52 51 52 53 51" stroke="#94A3B8" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M24 88C24 73 35 64 50 64C65 64 76 73 76 88" stroke="#38BDF8" stroke-width="3.5" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'architect',
    name: 'The Architect',
    tagline: 'System specs & RFC blueprints',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="50" fill="#16141F"/>
      <circle cx="50" cy="42" r="22" fill="#262235"/>
      <path d="M32 34C36 22 64 22 68 34C60 28 40 28 32 34Z" fill="#8257F5"/>
      <rect x="34" y="39" width="13" height="7" rx="1.5" stroke="#A78BFA" stroke-width="2.2"/>
      <rect x="53" y="39" width="13" height="7" rx="1.5" stroke="#A78BFA" stroke-width="2.2"/>
      <line x1="47" y1="42.5" x2="53" y2="42.5" stroke="#A78BFA" stroke-width="2.2"/>
      <circle cx="40.5" cy="42.5" r="1.5" fill="#FFFFFF"/>
      <circle cx="59.5" cy="42.5" r="1.5" fill="#FFFFFF"/>
      <path d="M46 52H54" stroke="#E2E8F0" stroke-width="2" stroke-linecap="round"/>
      <path d="M22 88C22 72 34 64 50 64C66 64 78 72 78 88" stroke="#8257F5" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M50 64V88" stroke="#A78BFA" stroke-width="2"/>
    </svg>`
  },
  {
    id: 'scholar',
    name: 'The Scholar',
    tagline: 'Books, citations & literature',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="50" fill="#1C1814"/>
      <circle cx="50" cy="42" r="22" fill="#2E2720"/>
      <path d="M30 40C30 25 45 18 58 20C68 22 70 30 70 40C62 30 50 28 38 34C34 36 31 38 30 40Z" fill="#F59E0B"/>
      <circle cx="41" cy="43" r="6" stroke="#FBBF24" stroke-width="2"/>
      <circle cx="59" cy="43" r="6" stroke="#FBBF24" stroke-width="2"/>
      <line x1="47" y1="43" x2="53" y2="43" stroke="#FBBF24" stroke-width="2"/>
      <circle cx="41" cy="43" r="2" fill="#FFFFFF"/>
      <circle cx="59" cy="43" r="2" fill="#FFFFFF"/>
      <path d="M46 53C48 55 52 55 54 53" stroke="#FDE68A" stroke-width="2" stroke-linecap="round"/>
      <path d="M22 88C22 72 34 64 50 64C66 64 78 72 78 88" stroke="#F59E0B" stroke-width="3.5" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'night-owl',
    name: 'The Night Owl',
    tagline: 'Midnight lo-fi & terminal flow',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="50" fill="#0C0A14"/>
      <circle cx="50" cy="44" r="21" fill="#1E192D"/>
      <path d="M32 35C35 22 65 22 68 35C58 28 42 28 32 35Z" fill="#A855F7"/>
      <path d="M24 44C24 28 34 18 50 18C66 18 76 28 76 44" stroke="#8257F5" stroke-width="4.5" stroke-linecap="round"/>
      <rect x="22" y="38" width="7" height="15" rx="3.5" fill="#A855F7"/>
      <rect x="71" y="38" width="7" height="15" rx="3.5" fill="#A855F7"/>
      <circle cx="43" cy="44" r="2.5" fill="#FFFFFF"/>
      <circle cx="57" cy="44" r="2.5" fill="#FFFFFF"/>
      <path d="M46 53H54" stroke="#C084FC" stroke-width="2" stroke-linecap="round"/>
      <path d="M24 88C24 73 35 65 50 65C65 65 76 73 76 88" stroke="#8257F5" stroke-width="3.5" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'thinker',
    name: 'The Thinker',
    tagline: 'Philosophical synthesis',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="50" fill="#12161A"/>
      <circle cx="50" cy="42" r="22" fill="#1F2830"/>
      <path d="M31 38C34 24 55 20 66 26C72 31 71 40 71 40C62 31 48 30 35 34C33 35 31 37 31 38Z" fill="#10B981"/>
      <ellipse cx="43" cy="41" rx="2.5" ry="3.5" fill="#FFFFFF"/>
      <ellipse cx="57" cy="41" rx="2.5" ry="3.5" fill="#FFFFFF"/>
      <path d="M46 51C48 53 52 53 54 51" stroke="#6EE7B7" stroke-width="2" stroke-linecap="round"/>
      <path d="M22 88C22 72 34 64 50 64C66 64 78 72 78 88" stroke="#10B981" stroke-width="3.5" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'naturalist',
    name: 'The Naturalist',
    tagline: 'Tea rituals & daily journaling',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="50" fill="#101712"/>
      <circle cx="50" cy="42" r="22" fill="#1C2920"/>
      <path d="M30 38C35 22 65 22 70 38C60 30 40 30 30 38Z" fill="#34D399"/>
      <path d="M50 20C50 14 56 12 60 14C60 18 56 20 50 20Z" fill="#10B981"/>
      <circle cx="43" cy="43" r="2.5" fill="#FFFFFF"/>
      <circle cx="57" cy="43" r="2.5" fill="#FFFFFF"/>
      <path d="M47 52C49 54 51 54 53 52" stroke="#A7F3D0" stroke-width="2" stroke-linecap="round"/>
      <path d="M22 88C22 72 34 64 50 64C66 64 78 72 78 88" stroke="#34D399" stroke-width="3.5" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'pioneer',
    name: 'The Pioneer',
    tagline: 'Bold experiments & speed writing',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="50" fill="#1C1318"/>
      <circle cx="50" cy="42" r="22" fill="#2E1D26"/>
      <path d="M32 32C42 20 62 20 68 30C58 26 44 26 32 32Z" fill="#F43F5E"/>
      <path d="M33 40H67V46C67 48 65 50 63 50H37C35 50 33 48 33 46V40Z" fill="#FB7185" fill-opacity="0.85"/>
      <line x1="33" y1="43" x2="67" y2="43" stroke="#FFFFFF" stroke-width="1.5" stroke-opacity="0.8"/>
      <path d="M47 54H53" stroke="#FDA4AF" stroke-width="2" stroke-linecap="round"/>
      <path d="M22 88C22 72 34 64 50 64C66 64 78 72 78 88" stroke="#F43F5E" stroke-width="3.5" stroke-linecap="round"/>
    </svg>`
  }
];

export const getPresetAvatarUrl = (idOrPreset: string): string => {
  const match = AVATAR_PRESETS.find((p) => p.id === idOrPreset);
  if (match) {
    return encodeSvg(match.svg);
  }
  return encodeSvg(AVATAR_PRESETS[0].svg);
};

export const getDefaultAvatar = (): string => {
  return encodeSvg(AVATAR_PRESETS[0].svg);
};
