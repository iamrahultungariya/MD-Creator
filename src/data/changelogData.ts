export interface ChangelogItem {
  type: 'added' | 'changed' | 'performance' | 'removed' | 'fixed';
  title: string;
  description: string;
  badge?: string;
}

export interface ChangelogRelease {
  version: string;
  versionLabel: string;
  date: string;
  title: string;
  summary: string;
  tag: 'Latest' | 'Stable' | 'Major';
  metrics?: Array<{
    label: string;
    value: string;
  }>;
  items: ChangelogItem[];
}

export const CHANGELOG_RELEASES: ChangelogRelease[] = [
  {
    version: '2.2.1',
    versionLabel: 'v2.2.1',
    date: 'November 9, 2026',
    title: 'Reliable AI Note Editing, Accurate Storage & Multi-Device Sync Protection',
    summary:
      'This update ensures applying AI-suggested changes is completely reliable on long documents, makes your local storage numbers drop immediately when deleting notes, and prevents deleted files on one computer from accidentally reappearing on another.',
    tag: 'Latest',
    metrics: [
      { label: 'AI Change Apply', value: '100% Reliable' },
      { label: 'Disk Space Meter', value: 'Instant & Accurate' },
      { label: 'Multi-Device Deletions', value: 'Safe & Synced' },
      { label: 'Unused Photos', value: 'Auto-Cleaned' },
    ],
    items: [
      {
        type: 'fixed',
        title: 'Seamless AI Note Editing',
        description:
          'Fixed an issue where clicking "Apply Changes" on large documents with multiple headings or paragraphs would occasionally fail. Mimo now matches and updates complex document sections smoothly without touching unrelated text.',
        badge: 'Reliable Edits',
      },
      {
        type: 'fixed',
        title: 'Accurate Workspace Storage Meter',
        description:
          'Permanently deleting notes now immediately reduces your storage counter. The storage gauge now focuses solely on your actual notes, revisions, and images rather than temporary browser cache files.',
        badge: 'Instant Cleanup',
      },
      {
        type: 'added',
        title: 'Multi-Device Deletion Review',
        description:
          'When you delete a document on your home computer, opening your laptop or phone no longer accidentally restores it. The app now asks if you want to delete it everywhere, keep it as an offline-only note, or restore it to all devices.',
        badge: 'Cross-Device',
      },
      {
        type: 'performance',
        title: 'Automatic Cleanup for Deleted Photos',
        description:
          'When you permanently delete a note containing images, those embedded images are now automatically removed from your local storage so your device stays clean and fast.',
        badge: 'Zero Leftovers',
      },
    ],
  },
  {
    version: '2.2.0',
    versionLabel: 'v2.2.0',
    date: 'November 9, 2026',
    title: 'Faster Startup, Calmer Design & Smarter Suggestions',
    summary:
      'This update cleans up the entire workspace for a faster, distraction-free writing experience. The app opens noticeably quicker, pages load with instant previews, and Mimo now remembers the writing tasks you use most.',
    tag: 'Stable',
    metrics: [
      { label: 'App Startup', value: 'Opens Instantly' },
      { label: 'Page Transitions', value: 'Instant Previews' },
      { label: 'Visual Design', value: 'Calm & Minimal' },
      { label: 'Cloud Backup', value: 'Automatic & Silent' },
    ],
    items: [
      {
        type: 'performance',
        title: 'Faster Page Load Times',
        description:
          'Cleaned up unused background fonts so the app opens noticeably faster on both desktop and mobile, especially over cellular or slower networks.',
        badge: 'Faster Load',
      },
      {
        type: 'changed',
        title: 'Instant Screen Previews',
        description:
          'Replaced the old spinning loading screen with instant skeleton previews. Switching between your notes, settings, and documents now feels instant and smooth.',
        badge: 'Smooth Feel',
      },
      {
        type: 'added',
        title: 'Mimo Learns Your Writing Habits',
        description:
          'Mimo quietly notices what you ask for most—such as quick summaries, comparison tables, or proofreading—and puts those suggestions first so you spend less time typing prompts.',
        badge: 'Personalized',
      },
      {
        type: 'added',
        title: 'Seamless Device Sync',
        description:
          'Your learned writing shortcuts and preferences automatically sync across your laptop, tablet, and phone in the background without any manual steps.',
        badge: 'Multi-Device',
      },
      {
        type: 'changed',
        title: 'Compact, Helpful Suggestions',
        description:
          'Replaced bulky suggestion boxes with neat, single-line recommendation chips anchored right above the chat bar, giving you quick actions based on your current note.',
        badge: 'Clean Workspace',
      },
      {
        type: 'removed',
        title: 'Distraction-Free Visuals',
        description:
          'Cleaned up flashy neon colors, busy icon boxes, and visual clutter across menus and buttons, leaving a calm, studio-grade writing space focused on your words.',
        badge: 'Focused',
      },
      {
        type: 'added',
        title: 'Quick Slash Commands (/)',
        description:
          'Type "/" inside Mimo\'s prompt box or the editor to instantly see shortcuts for summarizing, generating tables, cleaning markdown notes, and polishing prose.',
        badge: 'Shortcuts',
      },
    ],
  },
  {
    version: '2.1.0',
    versionLabel: 'v2.1.0',
    date: 'October 31, 2026',
    title: 'Clearer AI Suggestions, Focused Edits & Conversation Cleanup',
    summary:
      'Mimo now asks clarifying questions before writing so you get exactly what you want, edits specific sections without altering the rest of your note, and lets you clean up chat history with a single command.',
    tag: 'Stable',
    metrics: [
      { label: 'Prompt Clarity', value: 'Zero Guesswork' },
      { label: 'Edit Precision', value: 'Section by Section' },
      { label: 'Idle AI State', value: 'Sleeps When Idle' },
    ],
    items: [
      {
        type: 'added',
        title: 'Helpful Clarification Questions',
        description:
          'When a request could be interpreted in multiple ways, Mimo asks a quick multiple-choice question to confirm your preferred tone, audience, and detail level before writing.',
        badge: 'Clear Results',
      },
      {
        type: 'added',
        title: 'Section-Only Editing',
        description:
          'Ask Mimo to revise just a specific heading or paragraph without worrying that it will change or re-write the rest of your document.',
        badge: 'Safe Edits',
      },
      {
        type: 'added',
        title: 'Quiet Presence When Inactive',
        description:
          'Mimo gently rests when you pause writing and wakes up the moment you move your mouse or start typing, keeping your screen peaceful while you focus.',
        badge: 'Quiet Presence',
      },
      {
        type: 'added',
        title: 'One-Click Chat Cleanup (/compact)',
        description:
          'Type /compact anytime to condense long conversations into a neat summary, keeping Mimo fast, responsive, and lightweight during long writing sessions.',
        badge: 'Chat Cleanup',
      },
      {
        type: 'changed',
        title: 'Side-by-Side Change Review',
        description:
          'Inspect proposed text edits with clear green and red highlighted lines so you can review every change before accepting it into your note.',
        badge: 'Visual Preview',
      },
      {
        type: 'added',
        title: 'Quick Generation Settings',
        description:
          'Easily adjust how deeply Mimo reasons and toggle live web search on or off right from a tidy popover directly above the input bar.',
        badge: 'Customizable',
      },
    ],
  },
  {
    version: '2.0.0',
    versionLabel: 'v2.0.0',
    date: 'October 12, 2026',
    title: 'The All-New MD Writer — Offline First, Instant Backup & Built-In AI',
    summary:
      'A major milestone built from the ground up: complete offline writing freedom, automatic cloud sync, direct Google Gemini AI pair-writing, and visual math and table creators.',
    tag: 'Major',
    metrics: [
      { label: 'Typing Feel', value: 'Zero Lag' },
      { label: 'Offline Access', value: '100% Free & Local' },
      { label: 'AI Models', value: 'Gemini 3.5 & 3.8' },
    ],
    items: [
      {
        type: 'added',
        title: 'Write Anywhere Offline',
        description:
          'Every keystroke saves immediately on your computer. You can write on a train, plane, or without internet, and your notes will automatically backup to the cloud as soon as you reconnect.',
        badge: 'Offline Capable',
      },
      {
        type: 'added',
        title: 'Direct Google Gemini Writing Assistant',
        description:
          'Fast, real-time AI assistance built right in. Choose between fast pair-writing or deeper reflection for complex essays and technical docs.',
        badge: 'Direct Streaming',
      },
      {
        type: 'added',
        title: 'Interactive Math & Equation Editor',
        description:
          'Write beautiful mathematical formulas and scientific symbols with live visual previews as you type.',
        badge: 'Math & Science',
      },
      {
        type: 'added',
        title: 'Spreadsheet-Friendly Table Creator',
        description:
          'Create clean formatted tables with a visual grid, or paste data directly from Excel or Google Sheets.',
        badge: 'Tables',
      },
      {
        type: 'added',
        title: 'Automatic Multi-Device Backup',
        description:
          'Your notes, revisions, and favorites automatically sync across all your devices, so you can pick up right where you left off.',
        badge: 'Cloud Backup',
      },
      {
        type: 'added',
        title: 'Feedback & Ideas Portal',
        description:
          'Share feedback, request new features, or report bugs directly inside the app to help shape the future of MD Writer.',
        badge: 'Community',
      },
    ],
  },
];
