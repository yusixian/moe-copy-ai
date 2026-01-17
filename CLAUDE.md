# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**moe-copy-ai** is a Chrome extension built with Plasmo framework that provides AI-powered web content extraction. The extension supports mobile browsers (Kiwi Browser) and offers intelligent content scraping, metadata extraction, and AI-powered summarization.

## Assistant Operating Principles

- Prioritize explicit rules and constraints before user preferences or convenience.
- Classify tasks as trivial/moderate/complex; for moderate/complex use Plan -> Code workflow with 1-3 options, tradeoffs, risks, and verification steps.
- Ask clarifying questions only when missing info would change the main solution; otherwise proceed with reasonable assumptions.
- In Code mode, make minimal reviewable changes, list touched files and intent, and state how to verify; proactively fix mistakes you introduced.
- Warn before destructive actions; offer safer alternatives; avoid history rewrites unless explicitly requested.
- Output structure for non-trivial tasks: direct conclusion first, brief reasoning, options (if any), next steps.
- Language: explanations in Simplified Chinese; code, identifiers, comments, and commit messages in English; avoid beginner-level explanations.

## Core Engineering Principles

### 1. Module-First Principle

**Every feature must be implemented as a standalone module with clear boundaries.**

- Logic organized into focused, single-responsibility modules
- Module structure: `utils/` (core logic), `hooks/` (React hooks), `components/` (UI), `background/messages/` (Chrome messaging), `constants/` (config)
- Extract shared logic when used 2+ times

### 2. Interface-First Design

**Modules must expose clear, minimal public APIs.**

- Use barrel exports (`index.ts`) to define public interfaces when a module has multiple related exports
- Export TypeScript types alongside implementations
- Document complex functions with JSDoc

### 3. Functional-First Approach

**Prefer pure functions over stateful classes; manage side effects explicitly.**

- Write pure functions (same input → same output)
- Isolate side effects at boundaries (storage operations, Chrome API calls, AI service calls)
- Immutable data transformations

### 4. Test-Friendly Architecture

**Design code to be testable without excessive mocking.**

- Pure functions are naturally testable
- Testing priorities: High (utils, data transformations) > Medium (hooks, message handlers) > Low (UI components)
- Tests located in `utils/__tests__/`

### 5. Simplicity & Anti-Abstraction

**Resist premature abstraction; extract patterns after 2-3 instances.**

- Don't create abstractions for single-use cases
- Inline code until pattern becomes clear
- Keep abstractions simple and focused

### 6. Dependency Hygiene

**Manage dependencies carefully; avoid circular imports and bloat.**

- No circular dependencies between modules
- Keep dependency chain shallow

## Development Commands

### Core Commands

- `pnpm dev` or `npm run dev` - Run development server (Plasmo framework)
- `pnpm build` or `npm run build` - Build production bundle
- `pnpm package` or `npm run package` - Package for extension store

### Testing Commands

- `pnpm test` or `npm run test` - Run Vitest test suite
- `pnpm test:watch` or `npm run test:watch` - Run tests in watch mode
- `pnpm test:coverage` or `npm run test:coverage` - Generate coverage report
- `pnpm test:file` or `npm run test:file` - Run specific test file with `--testMatch` parameter

### Testing Individual Files

To test a single file, use: `npm run test:file -- "path/to/test.test.ts"`

## Architecture Overview

### Browser Extension Structure

This is a Chrome extension built with **Plasmo framework** that provides AI-powered web content extraction. The architecture follows the standard extension pattern:

- **Background scripts** (`background.ts`, `background/messages/`) - Handle extension lifecycle and messaging
- **Content scripts** (`contents/`) - Injected into web pages for DOM manipulation
- **Popup** (`popup.tsx`) - Extension popup interface
- **Options page** (`options.tsx`) - Settings and configuration
- **Components** (`components/`) - React UI components
- **Hooks** (`hooks/`) - Reusable React hooks
- **Utils** (`utils/`) - Core business logic and utilities
- **Constants** (`constants/`) - Configuration and type definitions

### Module Organization

**Dependency Flow** (avoid circular dependencies):

```
popup.tsx/options.tsx → components/ → hooks/ → utils/ → constants/
                          ↓
              background/messages/
```

**File Naming**:

- Barrel exports: `index.ts` (when module has multiple related exports)
- Single export: Match filename (`useIsMobile.ts`)
- React components: PascalCase (`ContentDisplay.tsx`)
- Utilities: camelCase (`extractor.ts`, `storage.ts`)

**Module Size Guidelines**:

- Max 500 lines per file (split if larger)
- Max 15 public exports per module
- Max 10 imports per file

### Core Functionality Modules

#### Content Extraction System (`utils/extractor.ts`)

- **Multi-tier selector system**: Uses prioritized CSS selectors for content extraction
- **Custom selector support**: Allows user-defined CSS selectors via storage
- **Smart fallbacks**: Article tags → custom selectors → default selectors → paragraph collections → body content
- **Metadata extraction**: Automatically extracts og:tags and meta information

#### AI Integration (`utils/ai-service.ts`)

- Built on **xsAI SDK** for lightweight AI operations
- Supports OpenAI-compatible APIs with configurable base URLs
- **Streaming text generation** with usage tracking
- **Chat history management** with local storage persistence

#### Storage Architecture (`utils/storage.ts`)

- **Dual storage**: Chrome sync storage for settings + local storage for history
- **Type-safe storage utilities** with error handling
- Settings: Custom selectors, AI config, UI preferences
- History: AI chat sessions with metadata

#### Data Flow

1. **Content Script** (`contents/scraper.ts`) extracts webpage data
2. **Background Messages** (`background/messages/`) coordinate between components
3. **Storage Utils** persist user settings and chat history
4. **AI Service** processes content with configurable prompts
5. **UI Components** display results with real-time editing

### Key Design Patterns

#### Selector Priority System

The extractor uses cascading selectors with fallbacks:

```
Article elements → Custom selectors → Default selectors → Paragraph collections → Body
```

#### Message-Based Architecture

Chrome extension messaging pattern for cross-context communication between popup, content scripts, and background.

#### Mobile-First Responsive Design

Built with Tailwind CSS, optimized for mobile browsers (Kiwi Browser support).

### State Management Decision Tree

Choose the appropriate state management approach based on these criteria:

| Use Case | Pattern | Example |
|----------|---------|---------|
| Component-local UI state (toggle, hover) | `useState` | Modal open/close, form inputs |
| Derived values from props/state | `useMemo` | Filtered lists, computed totals |
| External store sync (Chrome storage) | `useSyncExternalStore` | `useFloatButtonStorage` |
| Cross-context config (Chrome sync) | `useStorage` (Plasmo) | API keys, user preferences |
| Avoid stale closures in callbacks | `useRef` + current value | `useAiSettings`, `useElementSelector` |
| Heavy data + local persistence | Chrome local storage | AI chat history |

**Key Guidelines:**

1. **Prefer derived state over synced state**: Use `useMemo` instead of `useEffect` to sync state
   ```tsx
   // ✅ Good - derived state
   const mode = useMemo(() => {
     if (isSelecting) return "selecting"
     if (extractedContent) return "extracted"
     return "idle"
   }, [isSelecting, extractedContent])

   // ❌ Bad - synced state via useEffect
   useEffect(() => {
     if (isSelecting) setMode("selecting")
     else if (extractedContent) setMode("extracted")
   }, [isSelecting, extractedContent])
   ```

2. **Use refs for values needed in callbacks without triggering re-renders**
   ```tsx
   const settingsRef = useRef(settings)
   settingsRef.current = settings

   const callback = useCallback(() => {
     // Access current value without dependency
     doSomething(settingsRef.current)
   }, [])
   ```

3. **Chrome storage patterns:**
   - Sync storage: User preferences, settings (synced across devices)
   - Local storage: Large data, history, caches (device-specific)

### Development Environment

- **Framework**: Plasmo (Chrome extension framework)
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom animations
- **AI SDK**: xsAI (lightweight alternative to OpenAI SDK)
- **Testing**: Vitest with jsdom
- **Build Target**: Chrome Manifest V3

### Testing Structure

- Tests located in `utils/__tests__/`
- Coverage focused on utility functions
- Uses jsdom for DOM testing
- Custom module mapping for `~` alias

### Build Artifacts

Development builds go to `build/chrome-mv3-dev/` for local testing in Chrome developer mode.

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

## Internationalization (i18n)

- Never hardcode user-visible text; always use `useI18n()` + keys.
- Keep keys flat with dot notation; use descriptive names (e.g. `error.apiKeyNotSet`).
- Update both `locales/zh_CN.json` and `locales/en_US.json`.
- Include `t` in `useCallback` deps; keep background errors in English; use `labelKey`/`descKey` in constants.

## Development Checklist

- Understand requirements; check existing patterns; avoid circular deps.
- Follow module-first, pure functions, strict TypeScript.
- Use existing hooks/components; keep components small; handle loading/error states.
- Clean up listeners; handle `chrome.runtime.lastError`; keep storage async and centralized.
- Verify with `pnpm lint` and `pnpm test`

## Common Code Smells & Pitfalls

- Circular dependencies, god modules, or business logic inside components.
- Deep prop drilling, duplicate state, or stale listeners causing re-renders.
- Overuse of `useEffect` instead of derived values or event handlers.
- Missing `chrome.runtime.lastError` checks or uncleaned listeners in content scripts.
- Premature abstraction before a pattern appears 2-3 times.

## Testing Strategy

- High: extraction logic, data transforms, storage utilities, message handlers.
- Medium: complex hooks, state management.
- Low: presentational UI (manual checks are fine).

## IMPORTANT

- **Avoid feature flags and backwards compatibility shims** - directly modify code since the app is unreleased
- **Documentation lookup**: Use Context7 MCP server for official docs, or WebSearch if Context7 fails
- **Update CLAUDE.md**: Request updates when making major architectural changes
- **Chrome Extension Best Practices**: Always handle async operations, clean up listeners, and check for errors
