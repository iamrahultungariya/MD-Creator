#!/usr/bin/env node
/**
 * Production UI Architect - Automated Quality & Anti-Slop Scanner
 * 
 * Usage:
 *   node scripts/verify-ui.mjs [path-to-files-or-dir]
 *   node scripts/verify-ui.mjs --contrast "#09090B" "#E4E4E7"
 */

import fs from 'fs';
import path from 'path';

// --- 1. BANNED PATTERNS & REGEX AUDIT RULES ---
const BANNED_PATTERNS = [
  {
    id: 'BANNED_GRADIENT_TEXT',
    regex: /bg-gradient-to-[a-z]+[^"']*bg-clip-text/g,
    message: 'Banned multi-stop text gradient. Use solid high-contrast text with muted secondary words.',
  },
  {
    id: 'BANNED_TRANSITION_ALL',
    regex: /\btransition-all\b/g,
    message: 'Banned transition-all. Explicitly animate transform, opacity, background-color, or border-color.',
  },
  {
    id: 'BANNED_ANIMATE_BOUNCE',
    regex: /\banimate-bounce\b/g,
    message: 'Banned generic animate-bounce. Use tactile spring transitions or subtle hover lift.',
  },
  {
    id: 'BANNED_MUDDY_SLATE_DARK',
    regex: /\b(bg|text|border)-slate-(800|900|950)\b/g,
    message: 'Banned muddy slate palette in dark mode. Use neutral zinc luminance stepping (#09090B -> #111113 -> #18181B).',
  },
  {
    id: 'BANNED_EM_DASH_COPY',
    regex: /—/g,
    message: 'Banned em dash (—) in UI copy. Use comma, colon, period, or parentheses.',
  },
  {
    id: 'BANNED_GENERIC_AI_MARKETING',
    regex: /\b(supercharge|revolutionize|seamlessly elevate|cutting-edge|next-gen)\b/gi,
    message: 'Banned marketing buzzword. Write clear, outcome-driven, plain-spoken copy.',
  },
];

// --- 2. WCAG CONTRAST CALCULATOR ---
function hexToRgb(hex) {
  let cleaned = hex.replace('#', '');
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map((c) => c + c).join('');
  }
  const num = parseInt(cleaned, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function getRelativeLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function calculateContrastRatio(hex1, hex2) {
  const lum1 = getRelativeLuminance(hexToRgb(hex1));
  const lum2 = getRelativeLuminance(hexToRgb(hex2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// --- 3. DIRECTORY & FILE SCANNER ---
function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const violations = [];

  for (const rule of BANNED_PATTERNS) {
    let match;
    const regex = new RegExp(rule.regex);
    while ((match = regex.exec(content)) !== null) {
      const line = content.substring(0, match.index).split('\n').length;
      violations.push({
        id: rule.id,
        line,
        match: match[0],
        message: rule.message,
      });
    }
  }

  return violations;
}

function scanDirectory(dirPath, extensions = ['.tsx', '.jsx', '.html', '.css', '.js', '.ts']) {
  let results = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', 'dist', 'build', '.next'].includes(entry.name)) continue;
      results = results.concat(scanDirectory(fullPath, extensions));
    } else if (entry.isFile() && extensions.some((ext) => entry.name.endsWith(ext))) {
      const violations = scanFile(fullPath);
      if (violations.length > 0) {
        results.push({ file: fullPath, violations });
      }
    }
  }

  return results;
}

// --- 4. CLI ENTRY POINT ---
function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.length === 0) {
    console.log(`
Production UI Architect - Verification CLI
==========================================
Usage:
  node scripts/verify-ui.mjs <file-or-directory>
  node scripts/verify-ui.mjs --contrast <hexBg> <hexFg>

Examples:
  node scripts/verify-ui.mjs src/components
  node scripts/verify-ui.mjs --contrast "#09090B" "#E4E4E7"
`);
    process.exit(0);
  }

  if (args[0] === '--contrast' && args[1] && args[2]) {
    const ratio = calculateContrastRatio(args[1], args[2]);
    const passNormal = ratio >= 4.5;
    const passLarge = ratio >= 3.0;

    console.log(`\nContrast Analysis: ${args[1]} vs ${args[2]}`);
    console.log(`Calculated Ratio: ${ratio.toFixed(2)}:1`);
    console.log(`WCAG AA Normal Text (>= 4.5:1): ${passNormal ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`WCAG AA Large Text  (>= 3.0:1): ${passLarge ? '✅ PASS' : '❌ FAIL'}\n`);
    process.exit(passNormal ? 0 : 1);
  }

  const targetPath = path.resolve(args[0]);
  if (!fs.existsSync(targetPath)) {
    console.error(`Error: Path does not exist: ${targetPath}`);
    process.exit(1);
  }

  console.log(`\nScanning for AI Slop & UX Violations: ${targetPath}...`);
  const isDirectory = fs.statSync(targetPath).isDirectory();
  const report = isDirectory ? scanDirectory(targetPath) : [{ file: targetPath, violations: scanFile(targetPath) }];

  const totalViolations = report.reduce((acc, curr) => acc + curr.violations.length, 0);

  if (totalViolations === 0) {
    console.log(`\n✅ 100% CLEAN: Zero AI Slop patterns detected. Design passes verification.\n`);
    process.exit(0);
  } else {
    console.log(`\n❌ Found ${totalViolations} AI Slop violation(s):\n`);
    for (const item of report) {
      if (item.violations.length === 0) continue;
      console.log(`📄 ${item.file}`);
      for (const v of item.violations) {
        console.log(`   Line ${v.line}: [${v.id}] "${v.match}"`);
        console.log(`   ➔ ${v.message}\n`);
      }
    }
    process.exit(1);
  }
}

main();
