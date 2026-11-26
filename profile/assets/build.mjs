#!/usr/bin/env node
// Generates the org profile SVGs in light and dark variants from one source.
// Run from the repo root: `node profile/assets/build.mjs`
// Edit the templates here, never the emitted .svg files.
//
// hero-{dark,light}.svg and stats-{dark,light}.svg are NOT built here:
// OpenThrottle/monorepo's `@openthrottle/openthrottle-product:generate-surfaces`
// draws them (the hero from `renderHeroSvg`, the stats card from live numbers),
// alongside profile/README.md. Copy them from its out/org-profile/assets/.
//
// Palette mirrors the app's dark theme (monorepo docs/marketing/format.json → brand).

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = dirname(fileURLToPath(import.meta.url));

const PALETTES = {
  dark: {
    bg: '#0A0D0F',
    border: '#20262D',
    card: '#13171B',
    fg: '#F7F9FA',
    glow: 0.28,
    grid: '#161B20',
    muted: '#7C8892',
    red: '#FF0000',
  },
  light: {
    bg: '#FFFFFF',
    border: '#D0D7DE',
    card: '#F6F8FA',
    fg: '#0A0D0F',
    glow: 0.14,
    grid: '#EEF1F4',
    muted: '#57606A',
    red: '#E00000',
  },
};

const SANS = `Inter, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif`;
const MONO = `'JetBrains Mono', SFMono-Regular, Menlo, Consolas, monospace`;

const esc = (s) => {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

// Rough Inter advance width, good enough to size chips and pills.
const textWidth = (s, px, k = 0.58) => {
  return Math.round(s.length * px * k);
};

const frame = (w, h, p, body, extraStyle = '') => {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" role="img">
<style>
  .sans { font-family: ${SANS}; }
  .mono { font-family: ${MONO}; }
  ${extraStyle}
</style>
<defs>
  <clipPath id="round"><rect width="${w}" height="${h}" rx="16"/></clipPath>
  <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
    <path d="M32 0H0V32" stroke="${p.grid}" stroke-width="1"/>
  </pattern>
</defs>
<g clip-path="url(#round)">
  <rect width="${w}" height="${h}" fill="${p.bg}"/>
  ${body}
</g>
<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="15.5" stroke="${p.border}"/>
</svg>
`;
};

const STAGES = [
  ['01', 'Plan', ['Ideas become', 'plans & tasks']],
  ['02', 'Run', ['Any agent CLI,', 'task by task']],
  ['03', 'Validate', ['Gates, CI and', 'evals every task']],
  ['04', 'Ship', ['Traceable commits', 'and merged PRs']],
  ['05', 'Remember', ['Merges feed', 'semantic search']],
];

const loop = (p) => {
  const w = 1280;
  const h = 470;
  const cardW = 216;
  const cardH = 184;
  const gap = 30;
  const x0 = 40;
  const y0 = 140;
  const cx = (i) => {
    return x0 + i * (cardW + gap);
  };

  const cards = STAGES.map(([n, name, lines], i) => {
    const x = cx(i);
    const accent = i === 1 ? p.red : p.border;
    return `<g>
    <rect x="${x}" y="${y0}" width="${cardW}" height="${cardH}" rx="12" fill="${p.card}" stroke="${accent}"/>
    <text class="mono" x="${x + 20}" y="${y0 + 38}" font-size="16" letter-spacing="2" fill="${p.red}">${n}</text>
    <text class="sans" x="${x + 20}" y="${y0 + 84}" font-size="32" font-weight="700" letter-spacing="-.5" fill="${p.fg}">${name}</text>
    <text class="sans" x="${x + 20}" y="${y0 + 126}" font-size="19" fill="${p.muted}">${esc(lines[0])}</text>
    <text class="sans" x="${x + 20}" y="${y0 + 154}" font-size="19" fill="${p.muted}">${esc(lines[1])}</text>
  </g>`;
  }).join('\n  ');

  const arrows = STAGES.slice(0, -1)
    .map((_, i) => {
      const x = cx(i) + cardW + 5;
      const y = y0 + cardH / 2;
      return `<path class="flow" d="M${x} ${y}H${x + 16}" stroke="${p.red}" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M${x + 14} ${y - 6}L${x + 21} ${y}L${x + 14} ${y + 6}" stroke="${p.red}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    })
    .join('\n  ');

  const startX = cx(4) + cardW / 2;
  const endX = cx(0) + cardW / 2;
  const by = y0 + cardH;
  const ry = 410;
  const label = 'every merge makes the next plan smarter';
  const lw = textWidth(label, 18, 0.62) + 40;
  const ret = `
  <path class="flow" d="M${startX} ${by + 8}V${ry - 16}Q${startX} ${ry} ${startX - 16} ${ry}H${endX + 16}Q${endX} ${ry} ${endX} ${ry - 16}V${by + 16}" stroke="${p.red}" stroke-width="2" stroke-dasharray="6 8" stroke-linecap="round"/>
  <path d="M${endX - 6} ${by + 20}L${endX} ${by + 12}L${endX + 6} ${by + 20}" stroke="${p.red}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="${w / 2 - lw / 2}" y="${ry - 19}" width="${lw}" height="38" rx="19" fill="${p.bg}" stroke="${p.border}"/>
  <text class="mono" x="${w / 2}" y="${ry + 6}" font-size="18" text-anchor="middle" fill="${p.fg}">${label}</text>`;

  const style = `
  @media (prefers-reduced-motion: no-preference) {
    .flow { stroke-dasharray: 6 8; animation: dash 1.4s linear infinite; }
  }
  @keyframes dash { to { stroke-dashoffset: -28; } }`;

  const body = `
  <rect width="${w}" height="${h}" fill="url(#grid)" opacity=".6"/>
  <text class="mono" x="40" y="58" font-size="17" letter-spacing="3" fill="${p.red}">THE LOOP</text>
  <text class="sans" x="40" y="106" font-size="42" font-weight="800" letter-spacing="-1" fill="${p.fg}">From idea to merged PR, and back again</text>
  ${cards}
  ${arrows}
  ${ret}`;

  return frame(w, h, p, body, style);
};

const ASSETS = { loop };

for (const [name, render] of Object.entries(ASSETS)) {
  for (const [scheme, palette] of Object.entries(PALETTES)) {
    writeFileSync(join(OUT, `${name}-${scheme}.svg`), render(palette));
  }
}
console.log(`wrote ${Object.keys(ASSETS).length * 2} SVGs to ${OUT}`);
