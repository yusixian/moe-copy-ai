# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

### Core Functionality Modules

#### Content Extraction System (`utils/extractor.ts`)

- **Multi-tier selector system**: Uses prioritized CSS selectors for content extraction
- **Custom selector support**: Allows user-defined CSS selectors via storage
- **Smart fallbacks**: Article tags → custom selectors → paragraph collections → body content
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

## Code Style

- Avoid code duplication - extract common types and components.
- Keep components focused - use hooks and component composition.
- Follow React best practices - proper Context usage, state management.
- Use TypeScript strictly - leverage type safety throughout.
- Build React features out of small, atomic components. Push data fetching, stores, and providers down to the feature or tab that actually needs them so switching views unmounts unused logic and prevents runaway updates instead of centralizing everything in a mega component.

### React Best Practices

#### Extract Custom Hooks for Reusable Logic

When the same `useState` + `useRef` + `useEffect` pattern appears 2+ times, extract it into a custom hook:

**Signs you need a custom hook:**

- Same state management pattern repeated across components
- Logic involves event listeners with cleanup
- State synchronization with refs (e.g., `isDraggingRef.current = isDragging`)

**Example: `useDrag` hook** (see `src/renderer/src/hooks/use-drag.ts`)

```typescript
// ❌ Bad: Duplicated drag logic in each component (30+ lines)
const [isDragging, setIsDragging] = useState(false);
const isDraggingRef = useRef(isDragging);
isDraggingRef.current = isDragging;
const dragStartPos = useRef({ x: 0, y: 0 });

useEffect(() => {
  const handleMouseMove = (e: MouseEvent) => { /* ... */ };
  const handleMouseUp = () => { /* ... */ };
  if (isDragging) {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }
  return () => { /* cleanup */ };
}, [isDragging]);

// ✅ Good: Extract to reusable hook
const { isDragging, onMouseDown } = useDrag({
  onDrag: ({ x, y }) => window.api.panel.drag(x, y),
});
```

**Hook naming conventions:**

- `use` prefix (required by React)
- Descriptive verb: `useDrag`, `useResize`, `useHover`
- Return object with clear properties

#### Avoid useCallback Overuse

Only use `useCallback` when:

- The callback is passed to a memoized child component
- The callback has dependencies that genuinely need to be tracked

**DON'T** wrap callbacks with empty dependencies or callbacks that aren't passed to memoized components:

```typescript
// ❌ Bad: Unnecessary useCallback
const handleClose = useCallback(() => {
  window.api.mainPanel.close();
}, []);

// ✅ Good: Regular function
const handleClose = () => {
  window.api.mainPanel.close();
};
```

#### Fix Circular Dependencies in useEffect

When event handlers need to access latest state without re-subscribing, use refs:

```typescript
// ❌ Bad: Circular dependency causes re-subscription every state change
const handleMouseMove = useCallback(
  (e: MouseEvent) => {
    if (!isDragging) return
    // ... logic
  },
  [isDragging]
)

useEffect(() => {
  if (isDragging) {
    window.addEventListener("mousemove", handleMouseMove)
  }
  return () => window.removeEventListener("mousemove", handleMouseMove)
}, [isDragging, handleMouseMove]) // Circular dependency!

// ✅ Good: Use ref and define handler inside effect
const isDraggingRef = useRef(isDragging)
isDraggingRef.current = isDragging

useEffect(() => {
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current) return
    // ... logic
  }

  if (isDragging) {
    window.addEventListener("mousemove", handleMouseMove)
  }
  return () => window.removeEventListener("mousemove", handleMouseMove)
}, [isDragging]) // No circular dependency
```

#### IPC Subscriptions Should Subscribe Once

IPC listeners should subscribe once on mount, not re-subscribe on state changes:

```typescript
// ❌ Bad: Re-subscribes every time isHovering changes
useEffect(() => {
  const cleanup = window.api.menu.onCheckMousePosition(() => {
    if (!isHovering) {
      window.api.menu.hide()
    }
  })
  return cleanup
}, [isHovering]) // Re-subscribes unnecessarily

// ✅ Good: Subscribe once, access state via ref
const isHoveringRef = useRef(isHovering)
isHoveringRef.current = isHovering

useEffect(() => {
  const cleanup = window.api.menu.onCheckMousePosition(() => {
    if (!isHoveringRef.current) {
      window.api.menu.hide()
    }
  })
  return cleanup
}, []) // Subscribe once
```

#### Avoid useState for Static Values

Don't use `useState` for values that never change:

```typescript
// ❌ Bad: useState for static value
const [versions] = useState(window.electron.process.versions);

// ✅ Good: Direct constant
const versions = window.electron.process.versions;
```

#### Extract Custom Hooks for Reusable Logic

When the same `useState` + `useRef` + `useEffect` pattern appears 2+ times, extract it into a custom hook:

**Signs you need a custom hook:**

- Same state management pattern repeated across components
- Logic involves event listeners with cleanup
- State synchronization with refs (e.g., `isDraggingRef.current = isDragging`)

**Example: `useDrag` hook** (see `src/renderer/src/hooks/use-drag.ts`)

```typescript
// ❌ Bad: Duplicated drag logic in each component (30+ lines)
const [isDragging, setIsDragging] = useState(false);
const isDraggingRef = useRef(isDragging);
isDraggingRef.current = isDragging;
const dragStartPos = useRef({ x: 0, y: 0 });

useEffect(() => {
  const handleMouseMove = (e: MouseEvent) => { /* ... */ };
  const handleMouseUp = () => { /* ... */ };
  if (isDragging) {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }
  return () => { /* cleanup */ };
}, [isDragging]);

// ✅ Good: Extract to reusable hook
const { isDragging, onMouseDown } = useDrag({
  onDrag: ({ x, y }) => window.api.panel.drag(x, y),
});
```

**Hook naming conventions:**

- `use` prefix (required by React)
- Descriptive verb: `useDrag`, `useResize`, `useHover`
- Return object with clear properties

#### Scroll Event Subscription in React

When subscribing to scroll events in React components, **use `useSyncExternalStore`** instead of `useState` + `useEffect` to avoid excessive re-renders:

```typescript
// ❌ Bad: Causes re-render on every scroll event
function useScrollPosition() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY); // Re-render every time!
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return scrollY;
}

// ✅ Good: Only re-renders when snapshot value changes
function createScrollStore() {
  let scrollY = 0;
  let listeners = new Set<() => void>();

  const handleScroll = () => {
    const newScrollY = window.scrollY;
    if (scrollY !== newScrollY) {
      scrollY = newScrollY;
      listeners.forEach(l => l());
    }
  };

  return {
    subscribe: (listener: () => void) => {
      if (listeners.size === 0) {
        window.addEventListener('scroll', handleScroll, { passive: true });
      }
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          window.removeEventListener('scroll', handleScroll);
        }
      };
    },
    getSnapshot: () => scrollY,
    getServerSnapshot: () => 0,
  };
}

function useScrollPosition() {
  const store = useMemo(() => createScrollStore(), []);
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}
```

Key benefits:

- Only triggers re-render when the tracked value actually changes
- Properly handles React concurrent mode and SSR
- Automatic cleanup when no components are subscribed
- See `src/hooks/useCurrentHeading.ts` for a real-world example

#### Media Query Hooks

Use the existing `useMediaQuery` hook from `@hooks/useMediaQuery` instead of creating custom media query detection:

```typescript
// ✅ Good: Use existing hooks
import { useIsMobile, useMediaQuery } from "@hooks/useMediaQuery"

// ❌ Bad: Custom media query detection
const [isMobile, setIsMobile] = useState(false)
useEffect(() => {
  const mql = window.matchMedia("(max-width: 768px)")
  setIsMobile(mql.matches)
  // ...
}, [])

function Component() {
  const isMobile = useIsMobile()
  const isLargeScreen = useMediaQuery("(min-width: 1024px)")
}
```

Available hooks in `src/hooks/useMediaQuery.ts`:

- `useMediaQuery(query)` - Generic media query hook
- `useIsMobile()` - `(max-width: 768px)`
- `useIsTablet()` - `(max-width: 992px)`
- `usePrefersColorSchemeDark()` - Dark mode preference
- `usePrefersReducedMotion()` - Reduced motion preference

## IMPORTANT

- Avoid feature flags and backwards compatibility shims - directly modify code since the app is unreleased.
- When you need to check the official documentation, use Context 7 to get the latest information, or search for it if you can't get it.
- When making major changes involving architectural alterations, etc., please request an update to CLAUDE.md at the end by yourself
