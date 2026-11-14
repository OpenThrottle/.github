#!/usr/bin/env node
// Generates the org profile SVGs in light and dark variants from one source.
// Run from the repo root: `node profile/assets/build.mjs`
// Edit the templates here, never the emitted .svg files.
//
// Palette mirrors the app's dark theme (monorepo docs/marketing/format.json → brand).

import { readFileSync, writeFileSync } from 'node:fs';
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

// The brand icon, embedded as a data URI: GitHub renders README SVGs as <img>,
// which blocks external fetches, so the image has to travel inside the SVG.
// Source: storage.googleapis.com/monorepo-production-assets/OpenThrottle/branding/icons/red/icon-256.png
const LOGO = `data:image/png;base64,${readFileSync(join(OUT, 'logo-256.png')).toString('base64')}`;

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

const hero = (p) => {
  const w = 1280;
  const h = 360;
  const speedLines = [
    [44, 300, 0.9],
    [62, 210, 0.5],
    [80, 260, 0.75],
    [98, 170, 0.4],
  ]
    .map(([y, len, o], i) => {
      return `<rect class="streak s${i}" x="${w - 60 - len}" y="${y}" width="${len}" height="3" rx="1.5" fill="url(#streak)" opacity="${o}"/>`;
    })
    .join('\n  ');

  const style = `
  @media (prefers-reduced-motion: no-preference) {
    .streak { animation: zip 2.2s cubic-bezier(.22,1,.36,1) both; }
    .s1 { animation-delay: .15s; } .s2 { animation-delay: .3s; }
    .s3 { animation-delay: .45s; } .s4 { animation-delay: .6s; }
  }
  @keyframes zip {
    0% { transform: translateX(-140px); opacity: 0; }
    100% { transform: translateX(0); }
  }`;

  const body = `
  <defs>
    <radialGradient id="glow" cx="220" cy="180" r="260" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${p.red}" stop-opacity="${p.glow}"/>
      <stop offset="1" stop-color="${p.red}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="streak" x1="0" x2="1">
      <stop offset="0" stop-color="${p.red}" stop-opacity="0"/>
      <stop offset="1" stop-color="${p.red}"/>
    </linearGradient>
    <linearGradient id="fade" x1="0" x2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="1"/>
      <stop offset=".75" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <mask id="gridmask"><rect width="${w}" height="${h}" fill="url(#fade)"/></mask>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#grid)" mask="url(#gridmask)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  ${speedLines}

  <image href="${LOGO}" x="92" y="52" width="256" height="256"/>

  <text class="mono" x="380" y="112" font-size="17" letter-spacing="3" fill="${p.red}">OPEN CORE · MCP-NATIVE · LOCAL-FIRST</text>
  <text class="sans" x="376" y="186" font-size="78" font-weight="800" letter-spacing="-2.5" fill="${p.fg}">OpenThrottle<tspan fill="${p.red}"> AI</tspan></text>
  <text class="sans" x="380" y="236" font-size="25" fill="${p.muted}">AI-powered feedback loops that move you 10× to 100× faster,</text>
  <text class="sans" x="380" y="270" font-size="25" fill="${p.muted}">without giving up control.</text>
  <text class="mono" x="380" y="320" font-size="19" fill="${p.fg}">plan <tspan fill="${p.red}">→</tspan> run <tspan fill="${p.red}">→</tspan> validate <tspan fill="${p.red}">→</tspan> ship <tspan fill="${p.red}">→</tspan> remember <tspan fill="${p.red}">↺</tspan></text>
  <rect x="0" y="${h - 4}" width="${w}" height="4" fill="${p.red}" opacity=".9"/>`;

  return frame(w, h, p, body, style);
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

const STATS = [
  ['689+', 'PRs merged'],
  ['74', 'packages'],
  ['8', 'applications'],
  ['6', 'agent CLIs'],
];

const AGENTS = ['Claude Code', 'Codex', 'Cursor', 'Grok', 'OpenCode', 'Antigravity'];

const stats = (p) => {
  const w = 1280;
  const h = 290;
  const colW = (w - 80) / STATS.length;

  const blocks = STATS.map(([n, label], i) => {
    const x = 40 + i * colW;
    return `<rect x="${x}" y="40" width="28" height="4" rx="2" fill="${p.red}"/>
  <text class="sans" x="${x}" y="116" font-size="68" font-weight="800" letter-spacing="-1.5" fill="${p.fg}">${n}</text>
  <text class="sans" x="${x}" y="152" font-size="24" fill="${p.muted}">${label}</text>`;
  }).join('\n  ');

  const label = 'BRING YOUR OWN AGENT';
  // Monospace label: 0.6em advance plus the 2.5px letter-spacing.
  let x = 40 + Math.round(label.length * (16 * 0.6 + 2.5)) + 24;
  const chips = AGENTS.map((a) => {
    const cw = textWidth(a, 20, 0.6) + 44;
    const chip = `<rect x="${x}" y="210" width="${cw}" height="46" rx="23" fill="${p.card}" stroke="${p.border}"/>
  <circle cx="${x + 20}" cy="233" r="4.5" fill="${p.red}"/>
  <text class="sans" x="${x + 33}" y="240" font-size="20" font-weight="600" fill="${p.fg}">${a}</text>`;
    x += cw + 10;
    return chip;
  }).join('\n  ');

  const body = `
  <line x1="40" y1="186" x2="${w - 40}" y2="186" stroke="${p.border}"/>
  ${blocks}
  <text class="mono" x="40" y="239" font-size="16" letter-spacing="2.5" fill="${p.muted}">${label}</text>
  ${chips}`;

  return frame(w, h, p, body);
};

const ASSETS = { hero, loop, stats };

for (const [name, render] of Object.entries(ASSETS)) {
  for (const [scheme, palette] of Object.entries(PALETTES)) {
    writeFileSync(join(OUT, `${name}-${scheme}.svg`), render(palette));
  }
}
console.log(`wrote ${Object.keys(ASSETS).length * 2} SVGs to ${OUT}`);
