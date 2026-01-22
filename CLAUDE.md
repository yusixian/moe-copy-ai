# CLAUDE.md

**moe-copy-ai** is a Plasmo-based Chrome extension for AI-powered web content extraction with mobile browser support.

## Assistant Operating Principles

- Prioritize explicit rules and constraints before user preferences or convenience.
- Classify tasks as trivial/moderate/complex; for moderate/complex use Plan -> Code workflow with 1-3 options, tradeoffs, risks, and verification steps.
- Ask clarifying questions only when missing info would change the main solution; otherwise proceed with reasonable assumptions.
- In Code mode, make minimal reviewable changes, list touched files and intent, and state how to verify; proactively fix mistakes you introduced.
- Warn before destructive actions; offer safer alternatives; avoid history rewrites unless explicitly requested.
- Output structure for non-trivial tasks: direct conclusion first, brief reasoning, options (if any), next steps.
- Language: explanations in Simplified Chinese; code, identifiers, comments, and commit messages in English; avoid beginner-level explanations.

## Core Engineering Rules

1. **Module-First**: Single-responsibility modules; extract shared logic at 2+ uses.
2. **Pure Functions**: Isolate side effects (storage, Chrome APIs, AI calls); immutable transforms.
3. **No Circular Deps**: Dependency flow: `popup/options → components → hooks → utils → constants`.
4. **TypeScript Strict**: No `any`; export types with implementations.

## Commands

- `pnpm dev` - Dev server; `pnpm build` - Production; `pnpm package` - Store package
- `pnpm test` - Run tests; `pnpm test:file -- "path"` - Test single file

## Architecture

### Structure

- `background/` - Extension lifecycle & messaging
- `contents/` - DOM injection scripts
- `popup.tsx` / `options.tsx` - UI entry points
- `components/` - React UI
- `hooks/` - React hooks
- `utils/` - Business logic (core)
- `constants/` - Config & types

### Key Modules

- **Extractor** (`utils/extractor.ts`): Multi-tier selector system with smart fallbacks (article → custom → defaults → paragraphs → body)
- **AI Service** (`utils/ai-service.ts`): xsAI SDK; streaming generation; chat history
- **Storage** (`utils/storage.ts`): Chrome sync (settings) + local (history); type-safe utilities

### State Management

| Use Case             | Pattern                     |
| -------------------- | --------------------------- |
| Local UI state       | `useState`                  |
| Derived values       | `useMemo` (not `useEffect`) |
| Chrome sync          | `useStorage` (Plasmo)       |
| Avoid stale closures | `useRef` + `.current`       |

**Rules:**

- Prefer derived state: `useMemo(() => computeFrom(props))` not `useEffect`
- Use refs for callback values without re-render dependencies
- Chrome sync storage: settings (cross-device); local storage: history/caches

## Code Style & Quality

- Avoid duplication; extract shared logic after 2+ uses.
- Keep components small; prefer composition and hooks; keep business logic in utils/hooks.
- TypeScript strict; avoid `any`; keep types close to logic.
- State: local-first, lift minimally, prefer derived state; immutable updates.
- Errors: handle at layer boundaries; check `chrome.runtime.lastError`; graceful UI fallback.
- Performance: lazy load heavy deps; clean up listeners; memoize only when expensive.

## React & UI Best Practices

- Use `/vercel-react-best-practices` for React components, refactors, and performance work.
- Use `/web-design-guidelines` for UI work, accessibility, and UX reviews.
- Prefer existing hooks in `hooks/` (notably `useI18n()`).
- Key React performance rules:
  - Parallelize independent async work; avoid waterfalls.
  - Dynamic import heavy components; load optional code only when used.
  - Avoid barrel imports for hot paths; import directly.
  - Prefer derived state and functional setState; keep effect deps primitive.
  - Memoize expensive subtrees; avoid subscribing to state only used in callbacks.
  - Deduplicate global event listeners; clean them up on unmount.

## i18n

- Always use `useI18n()` + flat keys (e.g. `error.apiKeyNotSet`).
- Update both `locales/zh_CN.json` and `locales/en_US.json`.
- Include `t` in `useCallback` deps.

## Testing (Vitest)

**Core Rules:**

- Use `vi.useFakeTimers()` + `vi.setSystemTime()` for time-dependent tests.
- Shared mocks in `utils/__tests__/mocks/` to avoid duplication.
- Always `resetMockStorage()` in `beforeEach` for test isolation.
- Only mock external boundaries (storage, network); test real logic.

**Mock Pattern:**

```typescript
import { createPlasmoStorageMock, resetMockStorage } from "./mocks";

vi.mock("@plasmohq/storage", () => createPlasmoStorageMock());

beforeEach(() => {
  vi.useFakeTimers();
  resetMockStorage();
});

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});
```

## Notes

- Directly modify code (no feature flags) - app is unreleased.
- Use Context7 MCP for docs, WebSearch as fallback.
- Always handle async ops, clean up listeners, check `chrome.runtime.lastError`.

## Vitest Testing Best Practices

### Core Principles

- **Fake Timers**: Use `vi.useFakeTimers()` + `vi.setSystemTime()` for time-dependent tests instead of real delays
- **Shared Mocks**: Place reusable mock definitions in `utils/__tests__/mocks/` to avoid duplication
- **Test Isolation**: Use `beforeEach`/`afterEach` with proper cleanup (`resetMockStorage()`, `vi.useRealTimers()`)
- **Avoid Over-Mocking**: Only mock external dependencies (storage, network); test real logic

### Mock Organization

```
utils/__tests__/
├── mocks/
│   ├── index.ts              # Barrel export for all mocks
│   └── plasmo-storage.ts     # Shared Plasmo storage mock with shared stores
├── ai-service.browser.ts
└── ...
```

Usage in test files:

```typescript
import { createPlasmoStorageMock, resetMockStorage } from "./mocks";

vi.mock("@plasmohq/storage", () => createPlasmoStorageMock());

beforeEach(() => {
  resetMockStorage(); // Clears shared sync/local stores
});
```

**Important**: The mock uses shared stores (syncStore, localStore) that persist across `new Storage()` calls. Always call `resetMockStorage()` in `beforeEach` to ensure test isolation.

### Anti-Patterns

| ❌ Don't                                   | ✅ Do Instead                                      |
| ------------------------------------------ | -------------------------------------------------- |
| `await new Promise(r => setTimeout(r, N))` | `vi.useFakeTimers()` + `vi.setSystemTime()`        |
| `(obj as unknown as MockType).clear()`     | Use typed mock utilities with `resetMockStorage()` |
| Duplicate mock definitions across files    | Import from `./mocks`                              |
| Test implementation details                | Test behavior and public APIs                      |
| Mock everything                            | Only mock external boundaries                      |

### Test Structure Template

```typescript
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPlasmoStorageMock, resetMockStorage } from "./mocks";

vi.mock("@plasmohq/storage", () => createPlasmoStorageMock());

describe("FeatureName", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00.000Z"));
    resetMockStorage();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("describes expected behavior", async () => {
    // Arrange
    // Act
    // Assert
  });
});
```

## IMPORTANT

- **Avoid feature flags and backwards compatibility shims** - directly modify code since the app is unreleased
- **Documentation lookup**: Use Context7 MCP server for official docs, or WebSearch if Context7 fails
- **Update CLAUDE.md**: Request updates when making major architectural changes
- **Chrome Extension Best Practices**: Always handle async operations, clean up listeners, and check for errors
