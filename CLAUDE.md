# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**moe-copy-ai** is a Plasmo-based Chrome extension for AI-powered web content extraction with mobile browser support.

## Assistant Operating Principles

- Prioritize explicit rules and constraints before user preferences or convenience.
- Classify tasks as trivial/moderate/complex; for moderate/complex use Plan -> Code workflow with 1-3 options, tradeoffs, risks, and verification steps.
- Ask clarifying questions only when missing info would change the main solution; otherwise proceed with reasonable assumptions.
- In Code mode, make minimal reviewable changes, list touched files and intent, and state how to verify; proactively fix mistakes you introduced.
- Warn before destructive actions; offer safer alternatives; avoid history rewrites unless explicitly requested.
- Output structure for non-trivial tasks: direct conclusion first, brief reasoning, options (if any), next steps.
- Language: explanations in Simplified Chinese; code, identifiers, comments, and commit messages in English; avoid beginner-level explanations.

## Commands

```bash
# Development
pnpm dev                    # Chrome dev server (load build/chrome-mv3-dev)
pnpm dev:firefox            # Firefox MV3 dev build
pnpm build                  # Chrome production build
pnpm build:firefox          # Firefox MV3 build + post-build script
pnpm package                # Build + create Chrome store package
pnpm package:firefox        # Build + create Firefox store package

# Linting (Biome)
pnpm lint                   # Check all files
pnpm lint:fix               # Autofix issues

# Testing (Vitest + Playwright browser mode)
pnpm test                   # Watch mode
pnpm test -- "path"         # Watch mode, filter by path
pnpm test:run               # Single run (CI)
pnpm test:ui                # Vitest UI
```

## Core Engineering Rules

1. **Module-First**: Single-responsibility modules; extract shared logic at 2+ uses.
2. **Pure Functions**: Isolate side effects (storage, Chrome APIs, AI calls); immutable transforms.
3. **No Circular Deps**: Dependency flow: `popup/options/sidepanel → components → hooks → utils → constants`.
4. **TypeScript Strict**: No `any`; export types with implementations.
5. **Browser Compatibility**: Minimum Chrome 88+; target modern CSS features (CSS variables, `oklch()`, `color-mix()`).
6. **Directly modify code** (no feature flags or backwards-compat shims) — app is unreleased.

## Architecture

### Entry Points & Structure

- `popup.tsx` — Extension popup (35rem width)
- `sidepanel.tsx` — Side panel with 4 tabs: singlescrape / batch / extraction / settings
- `options.tsx` — Settings page (lazy loads 6 setting sections)
- `background/` — Extension lifecycle; `messages/` subdir has Chrome messaging handlers
- `contents/` — Content scripts: `scraper.ts`, `floating-popup.tsx`, `element-selector.tsx`
- `components/` — React UI, organized by feature: `ai/`, `batch/`, `extraction/`, `option/`, `popup/`, `singlescrape/`, `sidepanel/`, `svg/`, `ui/`
- `contexts/` — React contexts (`BatchScrapeContext`)
- `hooks/` — React hooks (business logic layer)
- `utils/` — Core business logic, services, and pure functions
- `constants/` — Config, types, and theme definitions
- `locales/` — i18n JSON files (`zh_CN.json`, `en_US.json`)
- `styles/` — Global CSS and CSS variables

### Key Modules

- **Extractor** (`utils/extractor.ts`): Multi-tier selector system with smart fallbacks (article → custom selectors → defaults → paragraphs → body). Modes: `hybrid` / `selector` / `readability`.
- **AI Service** (`utils/ai-service.ts`): xsAI SDK integration; `generateSummary()` with streaming; chat history in localStorage (max 50 items).
- **Storage** (`utils/storage.ts`): Chrome sync storage for settings (cross-device, 8KB/item limit), local storage for history/caches.
- **Template** (`utils/template.ts`): `processTemplate()` with placeholders: `{{content}}`, `{{title}}`, `{{url}}`, `{{author}}`, `{{publishDate}}`, `{{cleanedContent}}`, `{{meta.xxx}}`.
- **Theme** (`constants/theme-colors.ts`): `THEME_CSS_VARIABLES` is the single source of truth for theme colors (OKLCH color space). Consumed by `tailwind-theme-plugin.js` and `floating-popup.tsx` (Shadow DOM inline styles).
- **i18n** (`utils/i18n/`): `I18nProvider` → `ThemeProvider` → `ErrorBoundary` → app content. Language detection: saved preference → `chrome.i18n.getUILanguage()` → `navigator.language` → `zh_CN`.

### Path Aliases

```typescript
// tsconfig.json: "~*": ["./*"]
import { useI18n } from "~utils/i18n"     // tilde resolves to project root
import PopupContent from "~/components/PopupContent"
```

### State Management

| Use Case             | Pattern                     |
| -------------------- | --------------------------- |
| Local UI state       | `useState`                  |
| Derived values       | `useMemo` (not `useEffect`) |
| Chrome sync          | `useStorage` (Plasmo)       |
| Avoid stale closures | `useRef` + `.current`       |

- Prefer derived state: `useMemo(() => computeFrom(props))` not `useEffect`
- Use refs for callback values without re-render dependencies

## Code Style

**Biome enforces:** 2-space indent, double quotes, no trailing commas, semicolons as needed, 80-column width, auto-organized imports.

**Naming:** React components `PascalCase`, hooks `useSomething`, utilities `camelCase`, test files `*.browser.ts` / `*.browser.tsx`.

**Conventions:**
- Keep components small; prefer composition and hooks; keep business logic in `utils/` and `hooks/`.
- State: local-first, lift minimally, prefer derived state; immutable updates.
- Errors: handle at layer boundaries; check `chrome.runtime.lastError`; graceful UI fallback.
- Performance: lazy load heavy deps; clean up listeners; memoize only when expensive.

## React & UI Best Practices

- Use `/vercel-react-best-practices` for React components, refactors, and performance work.
- Use `/web-design-guidelines` for UI work, accessibility, and UX reviews.
- Prefer existing hooks in `hooks/` (notably `useI18n()`).
- Key rules: parallelize independent async work; dynamic import heavy components; avoid barrel imports on hot paths; prefer derived state and functional `setState`; memoize expensive subtrees; deduplicate and clean up global event listeners.

## i18n

- Always use `useI18n()` + flat dot-separated keys (e.g. `error.apiKeyNotSet`).
- Update both `locales/zh_CN.json` and `locales/en_US.json`.
- Include `t` in `useCallback` deps.
- Pluralization: use `_one` / `_other` suffixes.
- Avoid nested key conflicts: a key cannot be both a value and a parent object.
  - Bad: `action.tag.mode.and` + `action.tag.mode.and.tooltip`
  - Good: `action.tag.mode.and` + `action.tag.tooltip.and`

## Testing (Vitest)

Tests run in Vitest browser mode (Playwright/Chromium). Test files: `*.browser.ts` / `*.browser.tsx`.

**Core rules:**
- Only mock external boundaries (storage, network); test real logic.
- Use `vi.useFakeTimers()` + `vi.setSystemTime()` for time-dependent tests (never `setTimeout` delays).
- Shared mocks live in `utils/__tests__/mocks/`; always import from there.
- The storage mock uses shared `syncStore`/`localStore` Maps that persist across `new Storage()` calls — always call `resetMockStorage()` in `beforeEach`.

**Test template:**

```typescript
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createPlasmoStorageMock, resetMockStorage } from "./mocks"

vi.mock("@plasmohq/storage", () => createPlasmoStorageMock())

describe("FeatureName", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2024-01-01T00:00:00.000Z"))
    resetMockStorage()
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it("describes expected behavior", async () => {
    // Arrange / Act / Assert
  })
})
```

## Important Notes

- **Documentation lookup**: Use Context7 MCP server for official docs, or WebSearch if Context7 fails.
- **Commits**: Follow Conventional Commits with scope, e.g. `feat(i18n): ...`, `fix(extractor): ...`.
- Always handle async operations, clean up listeners, and check `chrome.runtime.lastError`.
