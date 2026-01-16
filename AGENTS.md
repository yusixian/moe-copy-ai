# Repository Guidelines

## Project Structure & Module Organization

This is a Plasmo-based browser extension. Entry points live at `popup.tsx`, `sidepanel.tsx`, and `options.tsx`. Background and content scripts are in `background/` and `contents/`. Shared UI and logic live in `components/`, `hooks/`, `utils/`, and `styles/`. Static assets and docs are in `assets/` and `docs/`. Localization files are under `locales/`. Build outputs land in `build/` (do not edit by hand).

## Assistant Operating Principles

- Prioritize explicit rules and constraints before convenience or preferences.
- Classify tasks as trivial/moderate/complex; use a Plan -> Code workflow for moderate/complex tasks with options, tradeoffs, risks, and verification.
- Ask clarifying questions only when missing info would change the main solution; otherwise proceed with reasonable assumptions.
- Make minimal, reviewable changes; list touched files and intent; state how to verify; proactively fix mistakes you introduced.
- Warn before destructive actions; offer safer alternatives; avoid history rewrites unless explicitly requested.
- For non-trivial work, respond with direct conclusion first, brief reasoning, options if any, and next steps.

## Build, Test, and Development Commands

- `pnpm dev`: start the Plasmo dev server; load `build/chrome-mv3-dev` in your browser.
- `pnpm dev:firefox`: run the Firefox MV3 dev build.
- `pnpm build`: produce production bundles for Chrome.
- `pnpm build:firefox`: build Firefox MV3 and run the post-build script.
- `pnpm package` / `pnpm package:firefox`: create store-ready packages.
- `pnpm lint` / `pnpm lint:fix`: run Biome checks (and autofix).
- `pnpm test`, `pnpm test:run`, `pnpm test:ui`: run Vitest in watch, CI, or UI modes.

## Coding Style & Naming Conventions

TypeScript + React are standard. Formatting and linting are enforced by Biome with 2-space indentation, double quotes, 80-column line width, and semicolons as needed. Organize imports (Biome does this automatically). Follow existing patterns for file naming; React components are typically `PascalCase`, hooks are `useSomething`, and utilities are `camelCase`.

## Code Quality & Architecture

- Avoid code duplication; extract shared components, hooks, and utilities.
- Keep components focused and prefer composition over mega components.
- Avoid prop drilling across deep trees; lift shared logic into a local context or store and expose hooks.
- Push state and data fetching down to the feature entry point that needs it; keep global state minimal.
- Prefer small, testable units with clear boundaries; prioritize maintainability over cleverness.

## React Performance Essentials

- Use `/vercel-react-best-practices` for React components, refactors, and performance work.
- Use `/web-design-guidelines` for UI work, accessibility, and UX reviews.
- Prefer existing hooks in `hooks/` (notably `useI18n()`).
- Parallelize independent async work; avoid waterfalls.
- Dynamic import heavy components; load optional code only when used.
- Avoid barrel imports for hot paths; import directly.
- Prefer derived state and functional setState; keep effect deps primitive.
- Memoize expensive subtrees; avoid subscribing to state only used in callbacks.
- Deduplicate global event listeners; clean them up on unmount.

## i18n Guidelines

- Localization files live in `locales/`; update `locales/en_US.json` first, then `locales/zh_CN.json`.
- Use flat keys with dot separation (e.g., `exif.camera.model`).
- Support pluralization with `_one` and `_other` suffixes.
- Avoid nested key conflicts: a key cannot be both a string value and a parent object.
  - Bad: `action.tag.mode.and` + `action.tag.mode.and.tooltip`
  - Good: `action.tag.mode.and` + `action.tag.tooltip.and`
  - Bad: `photo.share.preview` + `photo.share.preview.download`
  - Good: `photo.share.preview` + `photo.share.downloadPreview`

## Testing Guidelines

Tests use Vitest with the browser runner (Playwright). Test files match `*.browser.ts` or `*.browser.tsx`. Screenshots and artifacts go to `vitest-test-results/`. There is no explicit coverage gate; add targeted tests when changing extraction, UI flows, or side panel behavior.

## Commit & Pull Request Guidelines

Commits follow Conventional Commits as seen in history, e.g. `feat(i18n): ...`, `docs: ...`, `fix: ...`. Use a short, scoped summary and present tense. PRs should target the `dev` branch, include a clear description of changes, and link issues when applicable. For UI changes, include screenshots or a short GIF.

## Configuration & Security Notes

Do not commit API keys or personal data. Any AI provider settings should be configured through the extension UI rather than hard-coded in source. Keep permissions and manifest changes minimal and document them in the PR.
