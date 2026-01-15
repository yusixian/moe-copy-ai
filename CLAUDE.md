# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**moe-copy-ai** is a Chrome extension built with Plasmo framework that provides AI-powered web content extraction. The extension supports mobile browsers (Kiwi Browser) and offers intelligent content scraping, metadata extraction, and AI-powered summarization.

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

- `pnpm test` or `npm run test` - Run Jest test suite
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

### Development Environment

- **Framework**: Plasmo (Chrome extension framework)
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom animations
- **AI SDK**: xsAI (lightweight alternative to OpenAI SDK)
- **Testing**: Jest with ts-jest and jsdom
- **Build Target**: Chrome Manifest V3

### Testing Structure

- Tests located in `utils/__tests__/`
- Coverage focused on utility functions
- Uses jsdom for DOM testing
- Custom module mapping for `~` alias

### Build Artifacts

Development builds go to `build/chrome-mv3-dev/` for local testing in Chrome developer mode.

## Code Style & Quality

### General Guidelines

- **Avoid code duplication**: Extract common types and components
- **Keep components focused**: Use hooks and component composition
- **TypeScript strict mode**: Leverage type safety throughout, avoid `any`
- **Atomic components**: Build features from small, focused components
- **Localized state**: Push data fetching and state management down to components that need them

### Error Handling Strategy

**Layered and context-appropriate:**

1. **Utility Layer** (`utils/`): Return `null` for missing data or throw typed errors for critical failures
2. **React Components**: Use `ErrorBoundary` for component errors, graceful degradation
3. **Async Operations**: Explicit try-catch with user feedback
4. **Chrome API Calls**: Always handle `chrome.runtime.lastError`
5. **Validation**: At system boundaries only (user input, external APIs, storage reads)

```typescript
// ✅ Good: Error handling in storage utility
export async function getSetting<T>(key: string): Promise<T | null> {
  try {
    const result = await chrome.storage.sync.get(key);
    return result[key] ?? null;
  } catch (error) {
    console.error(`Failed to get setting: ${key}`, error);
    return null;
  }
}

// ✅ Good: Error handling in component
function AiSummary() {
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async () => {
    try {
      const result = await generateSummary(content);
      setSummary(result);
    } catch (err) {
      setError("Failed to generate summary. Please try again.");
      console.error(err);
    }
  };
}
```

### State Management Best Practices

#### State Placement
- **Local first**: Keep state in component unless shared
- **Lift minimally**: Move state to nearest common ancestor only when needed
- **Chrome storage**: For persistent settings and cross-context data

#### Derived State
Prefer computation over synchronization:

```typescript
// ✅ Good: Computed value
const filteredLinks = links.filter(link => link.includes(searchTerm));

// ❌ Bad: Synchronized state
const [filteredLinks, setFilteredLinks] = useState([]);
useEffect(() => {
  setFilteredLinks(links.filter(link => link.includes(searchTerm)));
}, [links, searchTerm]);
```

#### Immutability
Always use immutable updates:

```typescript
// ✅ Good: Immutable update
setSettings(prev => ({ ...prev, darkMode: true }));

// ❌ Bad: Mutation
settings.darkMode = true;
setSettings(settings);
```

#### Chrome Storage Pattern
Centralize storage operations in `utils/storage.ts`:

```typescript
// ✅ Good: Typed storage utilities
export const storage = {
  getSettings: async () => {...},
  updateSettings: async (updates: Partial<Settings>) => {...},
  getHistory: async () => {...},
};
```

### Performance Best Practices

- **Lazy load heavy dependencies**: Dynamic imports for large libraries
- **Measure before optimizing**: Use Chrome DevTools Performance panel
- **Memoization**: Only for expensive computations (not premature optimization)
- **Event listeners**: Always clean up in useEffect return

```typescript
// ✅ Good: Lazy load heavy library
const handleExport = async () => {
  const { exportToPDF } = await import('./heavy-export-lib');
  await exportToPDF(data);
};
```

## React & UI Best Practices

For React and UI development, use the following Claude Code skills:

### React/Next.js
- `/vercel-react-best-practices` - React and Next.js performance optimization guidelines from Vercel Engineering. Use when writing, reviewing, or refactoring React components.

### UI/Web Design
- `/web-design-guidelines` - Review UI code for Web Interface Guidelines compliance. Use when reviewing UI, checking accessibility, or auditing design.

**When to invoke these skills:**
- Writing new React components → `/vercel-react-best-practices`
- Reviewing or refactoring existing React code → `/vercel-react-best-practices`
- Building UI components or pages → `/web-design-guidelines`
- Checking accessibility or UX → `/web-design-guidelines`
- Performance optimization → `/vercel-react-best-practices`

### Available hooks in `hooks/`:
- `useIsMobile()` - Mobile device detection
- `useAiSettings()` - AI configuration management
- `useContentExtraction()` - Content extraction logic
- `useScrapedData()` - Scraped data management

## Development Checklist

### Before Starting
- [ ] Understand requirement clearly
- [ ] Check existing code for similar patterns
- [ ] Verify no circular dependencies would be created
- [ ] Identify which modules need to be modified

### During Implementation
- [ ] Follow Module-First Principle
- [ ] Write pure functions where possible
- [ ] Use TypeScript strictly (no `any` unless unavoidable)
- [ ] Extract shared logic after 2nd use
- [ ] Handle errors appropriately for the layer
- [ ] Use existing hooks when available
- [ ] Clean up event listeners in useEffect returns

### Component Development
- [ ] Keep components under 300 lines
- [ ] Use composition over prop drilling
- [ ] Handle loading and error states
- [ ] Add proper TypeScript types for props
- [ ] Use existing UI components from `components/ui/`

### Chrome Extension Specifics
- [ ] Handle `chrome.runtime.lastError` for Chrome API calls
- [ ] Message listeners subscribe once (not in dependency arrays)
- [ ] Storage operations are async and error-handled
- [ ] Content scripts have proper cleanup on unmount

### Before Committing
- [ ] Run tests: `pnpm test`
- [ ] Fix linting issues (if applicable)
- [ ] Verify build succeeds: `pnpm build`
- [ ] Test in actual Chrome extension (load `build/chrome-mv3-dev/`)

## Common Code Smells

### Component-Level
- **Oversized components** (> 300 lines) → Split into smaller components
- **Props drilling** beyond 2-3 levels → Use Context or lift state differently
- **Overuse of useEffect** → Prefer derived state or event handlers
- **Missing error boundaries** → Wrap feature sections in ErrorBoundary

### State Management
- **Duplicate state** → Single source of truth
- **Stale state in listeners** → Use refs for event handlers
- **Unnecessary re-renders** → Check dependency arrays, use memo when needed

### Extension-Specific
- **Missing chrome.runtime.lastError checks** → Always check after Chrome API calls
- **Memory leaks in content scripts** → Clean up listeners on unmount
- **Re-subscribing to Chrome messages** → Subscribe once with refs for state access
- **Blocking storage operations** → Always use async storage APIs

### Code Organization
- **Circular dependencies** → Extract shared logic to new module
- **God modules** (too many exports) → Split into focused modules
- **Business logic in components** → Extract to utils or hooks

## Common Pitfalls

### 1. Circular Dependencies
Extract shared logic to separate file instead of importing between peer modules.

```typescript
// ❌ Bad: componentA imports componentB, componentB imports componentA
// components/A.tsx
import { helperB } from './B';

// components/B.tsx
import { helperA } from './A';

// ✅ Good: Extract shared logic
// utils/shared-helpers.ts
export function sharedHelper() { /* ... */ }

// components/A.tsx & components/B.tsx
import { sharedHelper } from '~utils/shared-helpers';
```

### 2. Chrome API Error Handling
Always check for errors after Chrome API calls:

```typescript
// ❌ Bad: No error handling
chrome.storage.sync.get('settings', (result) => {
  setSettings(result.settings);
});

// ✅ Good: Handle errors
chrome.storage.sync.get('settings', (result) => {
  if (chrome.runtime.lastError) {
    console.error('Storage error:', chrome.runtime.lastError);
    return;
  }
  setSettings(result.settings);
});

// ✅ Better: Use promise wrapper with try-catch
async function getSettings() {
  try {
    const result = await chrome.storage.sync.get('settings');
    return result.settings;
  } catch (error) {
    console.error('Storage error:', error);
    return null;
  }
}
```

### 3. Content Script Memory Leaks
Always clean up listeners when content scripts unmount:

```typescript
// ✅ Good: Cleanup in React component
useEffect(() => {
  const listener = (msg) => handleMessage(msg);
  chrome.runtime.onMessage.addListener(listener);

  return () => {
    chrome.runtime.onMessage.removeListener(listener);
  };
}, []);
```

### 4. Overuse of useEffect
Prefer derived values or event handlers:

```typescript
// ❌ Bad: Unnecessary useEffect
const [fullName, setFullName] = useState('');
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// ✅ Good: Derived value
const fullName = `${firstName} ${lastName}`;
```

### 5. Over-abstraction
Inline until pattern appears 2-3 times:

```typescript
// ❌ Bad: Premature abstraction for single use
const getButtonClassName = (variant: string, size: string) => {
  // complex logic for one button
};

// ✅ Good: Inline first, extract after 3rd use
<button className="px-4 py-2 bg-blue-500 text-white rounded">
  Click me
</button>
```

## Testing Strategy

**Test business logic rigorously; test UI pragmatically.**

**High Priority**:
- Content extraction logic (`utils/extractor.ts`)
- Data transformations
- Storage utilities
- Message handlers

**Medium Priority**:
- Complex React hooks
- State management logic

**Low Priority**:
- UI components (manual testing preferred)
- Simple presentational components

```typescript
// Example: Pure function test
describe("extractContent", () => {
  it("extracts content from article element", () => {
    document.body.innerHTML = `
      <article>
        <h1>Title</h1>
        <p>Content paragraph</p>
      </article>
    `;

    const result = extractContent(document);
    expect(result.title).toBe("Title");
    expect(result.content).toContain("Content paragraph");
  });
});
```

## IMPORTANT

- **Avoid feature flags and backwards compatibility shims** - directly modify code since the app is unreleased
- **Documentation lookup**: Use Context7 MCP server for official docs, or WebSearch if Context7 fails
- **Update CLAUDE.md**: Request updates when making major architectural changes
- **Chrome Extension Best Practices**: Always handle async operations, clean up listeners, and check for errors
