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
