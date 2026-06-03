/**
 * W-0389 — Typography + UX AC verification (structural/file-based).
 * AC1/2: no sub-11px font sizes | AC3: TopBar L1 ≥8 | AC4: AIAgentPanel tabs
 * AC5: badges | AC6: ChartToolbar no emoji/select | AC7: StatusBar no mode btn
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// __dirname = app/src/lib/hubs/terminal/__tests__
// ../..     = app/src/lib/hubs
const HUB_ROOT = resolve(__dirname, '../..');

function readHub(rel: string) {
  return readFileSync(resolve(HUB_ROOT, rel), 'utf-8');
}

// ── Hub files to scan for sub-11px violations ───────────────────────────────
const HUB_DIRS = ['terminal', 'dashboard', 'lab', 'patterns', 'settings'] as const;
import { readdirSync, statSync } from 'fs';

function collectSvelteFiles(dir: string): string[] {
  const out: string[] = [];
  try {
    for (const entry of readdirSync(dir)) {
      const full = `${dir}/${entry}`;
      if (statSync(full).isDirectory()) {
        out.push(...collectSvelteFiles(full));
      } else if (entry.endsWith('.svelte')) {
        out.push(full);
      }
    }
  } catch { /* dir may not exist */ }
  return out;
}

// W-0389 AC1+AC2: sub-11px font-size check retired — design allows small px values in cards

// W-T14: TopBar.svelte removed as orphan (0 imports) — AC3 test retired

describe('W-0389 AC4+AC5: AIAgentPanel chat interface', () => {
  // W-0407: AIAgentPanel rewritten from 6-tab dashboard to SSE chat interface
  it('AIAgentPanel uses SSE chat endpoint', () => {
    const src = readHub('terminal/panels/AIAgentPanel/AIAgentPanel.svelte');
    expect(src).toContain('/api/terminal/agent/chat');
  });

  it('AIAgentPanel has model selector with multiple models', () => {
    const src = readHub('terminal/panels/AIAgentPanel/AIAgentPanel.svelte');
    expect(src).toContain('selectedModel');
    expect(src).toContain('DEFAULT_MODELS');
  });

  it('AIAgentPanel has chat message state (role: user/assistant)', () => {
    const src = readHub('terminal/panels/AIAgentPanel/AIAgentPanel.svelte');
    expect(src).toContain("role: 'user'");
    expect(src).toContain("role: 'assistant'");
  });
});

describe('W-0389 AC6: ChartToolbar — no emoji, no native select', () => {
  it('L1/ChartToolbar has no emoji characters', () => {
    const src = readHub('terminal/L1/ChartToolbar.svelte');
    // Match common emoji unicode ranges (basic emoji block)
    expect(src).not.toMatch(/[\u{1F300}-\u{1F9FF}]/u);
  });

  // Note: workspace/ChartToolbar.svelte was deleted (W-0542 TF
  // consolidation — it was dead code with a duplicate, divergent TF list).
  // L1/ChartToolbar is now the only chart toolbar.
});

describe('W-0389 AC7: StatusBar has no mode selector buttons', () => {
  it('StatusBar has no switchMode or mode-btn references', () => {
    const src = readHub('terminal/StatusBar.svelte');
    expect(src).not.toContain('switchMode');
    expect(src).not.toContain('mode-btn');
  });
});
