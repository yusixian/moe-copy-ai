# Moe Copy AI

[简体中文](./README.md) | English

[![](https://github.com/yusixian/moe-copy-ai/blob/main/assets/docs/logo.webp?raw=true)](https://chromewebstore.google.com/detail/moe-copy-ai/dfmlcfckmfgabpgbaobgapdfmjiihnck)

<p align="center">
  <b>✨ A Cute AI-Powered Web Content Extraction Assistant ✨</b>
</p>

## Introduction

Moe Copy AI is a browser extension built with the Plasmo framework and xsAI SDK. It intelligently identifies and extracts structured data from web pages, providing high-quality input for AI models.

> The original need was simple: I wanted to easily copy full text, titles, authors, and metadata while browsing on mobile (Kiwi Browser), filter out distractions, and generate summaries - similar to [llms.txt](https://llmstxt.org/). This project is an experiment combining web tools with AI, prioritizing functionality over perfect code quality.

This extension is still in early development - feel free to Star and follow!

Since it's an extension, we aim to minimize bundle size (shoutout to [xsAI](https://github.com/moeru-ai/xsai) for being super lightweight) and reduce impact on injected pages. This is a purely utility-focused side project.

## Installation

Available on [Chrome Web Store](https://chromewebstore.google.com/detail/moe-copy-ai/dfmlcfckmfgabpgbaobgapdfmjiihnck) | [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/moe-copy-ai/)

- Alternatively: Download the extension zip (chrome-mv3-prod.zip) from the latest GitHub Release, open your browser's extension management page, enable **Developer Mode**, click "Load unpacked", and select the extracted extension folder.

## ✨ Features

![example](https://github.com/yusixian/moe-copy-ai/blob/main/assets/docs/example.webp?raw=true)
![example-2](https://github.com/yusixian/moe-copy-ai/blob/main/assets/docs/example-2.png?raw=true)
![example-3](https://github.com/yusixian/moe-copy-ai/blob/main/assets/docs/example-3.png?raw=true)

### Popup Mode

- **One-Click Parsing**: Click the extension icon or floating button to quickly parse current page content
- **Real-Time Editing**: Manually edit extracted content to meet custom needs
- **Live Preview**: Preview content changes in real-time while editing
- **Fullscreen Preview**: Markdown content supports fullscreen preview mode for better reading experience
- **Smart Recognition**: Automatically identifies article body, title, author, and publish date
- **Multiple Extraction Modes**:
  - **Selector Mode**: Uses CSS selectors for precise content extraction, ideal for structured sites like blogs
  - **Readability Mode**: Based on Mozilla Firefox's reader mode algorithm for smart content identification
  - **Hybrid Mode**: Uses both methods and automatically selects the best result (recommended)
- **Dual Output Formats**:
  - Original Format: Preserves Markdown formatting and original line breaks
  - Compact Version: Cleans excess whitespace and line breaks, optimized for AI model input
- **Smart Cleanup**: Automatically removes distracting elements, excess whitespace, and meaningless content
- **Word & Token Count**: Shows actual word count and estimated AI model token count with tokenization display (using [gpt-tokenizer](https://github.com/niieani/gpt-tokenizer))
- **Mobile Responsive**: Responsive design supporting mobile devices
- **Smart Image Extraction**: Extracts all images and their metadata from articles
- **Page Metadata**: Automatically extracts og:title, og:description, and other meta tags displayed in table format
- **Custom Selectors**: Allows users to define custom CSS selector rules
- **AI Content Summary**:
  - Chat with AI using extracted content variables (`{{content}}`, etc.)
  - Customizable summary prompts for different summarization needs
  - Auto-saves summary history for later reference
- **Data Export**: Export extracted content and summaries as JSON for storage and sharing

### Side Panel Mode 🆕

A brand new side panel interface for more efficient workflows.

- **Batch Scraping**: Extract content from multiple links at once
  - Visual element selector to directly select areas containing links on the page
  - Smart link extraction and management (add, edit, delete, same-domain filter)
  - Regex filtering: Custom regex or 8 built-in preset rules for link filtering
  - Pagination scraping: Select "Next Page" button for automatic page navigation and link collection
  - Three scraping strategies: Fetch API / Background Tabs / Current Tab
  - ZIP export for all scraped results
- **Content Extraction**: Select page elements and extract content as HTML / Markdown / Plain Text

### Internationalization Support 🌍

- **Multilingual Interface**: Full support for Simplified Chinese and English
  - Automatic browser language detection with auto-setup on first use
  - Manual language switching available in settings page
  - Language preferences synced across devices via Chrome sync storage
- **Localized Content**: All UI text, error messages, and AI prompts are localized (452 translation keys)
- **Translation Welcome**: See [Contributing Guide](./CONTRIBUTING.md#-translation-contributions) to improve translations or add new languages

### Configuration Options

- **Extraction Mode Settings**: Choose between Selector, Readability, or Hybrid mode based on site characteristics
- **Scrape Timing Settings**: Configure auto-scrape on page load or manual trigger only (default: manual)
- **Debug Panel Control**: Toggle debug information panel visibility
- **Log Level Settings**: Multiple log level options from trace to silent
- **AI Provider Settings**:
  - AI provider configuration based on [xsAI](https://xsai.js.org/docs/packages/overview)
  - API Key Configuration: Support for OpenAI or other compatible provider API keys
  - Model Selection: Select and fetch available AI model lists
  - System Prompt Customization: Customize default AI summary behavior and style

### Planned Features (Roadmap)

#### AI Enhancements

- Integrate xsai or other AI SDKs for smarter content processing
- Support AI-driven content analysis and understanding
- Image OCR & AI Image OCR for extracting text from images

#### More Customization

- Create and save scraping templates for specific websites
- Import/export custom selector configurations
- Provide preset configuration library for common websites

#### Feature Improvements

- Key information extraction and highlighting
- Structured data export: Support exporting to JSON, Markdown, and other formats
- Data cleaning and format conversion tools

## 📋 Development Roadmap

- [x] Implement basic UI framework and extension architecture
- [x] Develop core web content extraction functionality
- [x] Add basic text formatting and preview features
- [x] Web metadata extraction
- [x] Mobile adaptation
- [x] Complete basic error handling and logging
- [x] Add simple user configuration options
- [x] Custom extraction selectors
- [x] Integrate AI summary functionality
- [x] Add temporary floating button hide feature
- [x] Add AI summary history feature
- [x] Support JSON structured export
- [x] Side Panel functionality
- [x] Batch scraping multiple links
- [x] Content extraction (multiple output formats)
- [x] ZIP export
- [x] Internationalization of i18n
- [ ] Improve engineering & CI (initially let AI grow wild)
- [ ] Simple documentation site
- [ ] Add image AI OCR feature

## Development Guide

### Environment Setup

This is a browser extension project built with [Plasmo](https://docs.plasmo.com/).

```bash
# Install dependencies
pnpm i
# or
npm i

# Run development server
pnpm dev
# or
npm run dev
```

Open your browser and load the corresponding development build. For example, for Chrome (manifest v3), use: `build/chrome-mv3-dev`.

### Build for Production

```bash
pnpm build
# or
npm run build
```

This creates a production bundle that can be packaged and published to various extension stores.

## 🤝 Contributing

All forms of contributions are welcome, including new features, bug fixes, documentation improvements, and translations!

### Translation Contributions

We welcome improvements to existing translations or new language support:

- 📝 **Report translation issues**: Create an issue on [GitHub Issues](https://github.com/yusixian/moe-copy-ai/issues) with "translation" label
- 🌐 **Submit translation PR**: See [Contributing Guide](./CONTRIBUTING.md#-translation-contributions) for detailed steps
- ✨ **Add new language**: See [i18n Developer Guide](./docs/developer-guide/i18n-guide.mdx) to learn how to add a new language

### Code Contributions

1. Fork the project
2. Create a feature branch from dev (`git checkout -b feat/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add some amazing feature'`)
4. Push to branch (`git push origin feat/amazing-feature`)
5. Create a Pull Request to the dev branch

For detailed contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md)

## Acknowledgments

- Logo and style inspiration from [xsai](https://github.com/moeru-ai/xsai) (a humble imitation of the cute A~)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yusixian/moe-copy-ai&type=date&legend=top-left)](https://www.star-history.com/#yusixian/moe-copy-ai&type=date&legend=top-left)

## License

GNU Affero General Public License version 3 (AGPL-3.0)
