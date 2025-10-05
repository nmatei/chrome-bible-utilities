# Copilot Instructions for Chrome Bible Utilities Extension

## Project Overview

This is a **Chrome extension** published on the Google Chrome Web Store that helps churches and users **project Bible verses** from bible.com onto external screens/projectors. The extension provides an intuitive interface for selecting verses from the Bible and displaying them in popup projection windows.

### Key Characteristics

- **Target Platform**: Chrome Extension (Manifest V3)
- **Architecture**: Simple vanilla JavaScript components (no frameworks)
- **Primary Purpose**: Project selected Bible verses to external displays
- **Communication**: Uses `chrome.runtime.sendMessage` for inter-window communication
- **Storage**: Chrome extension storage API for user settings and preferences

## Core Functionality

### Main Features

1. **Verse Selection & Projection**: Users click on verse numbers on bible.com to select and project them
2. **Multiple Projection Windows**: Supports up to 2 projection windows (Window 1 & Window 2)
3. **Parallel Bible Support**: Can display verses in multiple translations/languages simultaneously
4. **Live Text Projection**: Project custom text/slides with Markdown formatting
5. **Pin Verses**: Save and quickly access frequently used verse references
6. **Settings Panel**: Customize display appearance, fonts, colors, backgrounds

### Window Architecture

- **Content Scripts**: Injected into bible.com pages for verse selection
- **Background Script**: Service worker handling window management and messaging
- **Projection Windows**: Popup windows (`views/projector/tab.html`) for displaying verses
- **Settings Window**: Configuration panel (`views/settings/options.html`)

### Communication Flow

```javascript
// Content script to background script
chrome.runtime.sendMessage({
  action: "updateText",
  payload: { text, markdown, index }
});

// Background script to projection window
chrome.tabs.sendMessage(tab.id, message);
```

## Codebase Structure

### Key Directories

- `views/main/`: Core content script functionality and UI actions
- `views/background.js`: Service worker for window management
- `views/projector/`: Projection window HTML/CSS/JS
- `views/settings/`: Settings panel and user preferences
- `views/common/`: Shared utilities and components
- `views/bibles/`: Bible.com specific selectors and mappings
- `test/`: Unit and integration tests

### Important Files

- `manifest.json`: Extension configuration and permissions
- `views/main/runtime-messages.js`: Communication layer between windows
- `views/main/index.js`: Main content script entry point
- `views/background.js`: Background service worker
- `views/bibles/bible.com/selectors.js`: DOM selectors for bible.com
- `views/common/utilities.js`: Shared utility functions

## Development Guidelines

### Code Style & Patterns

- **Vanilla JavaScript**: No frameworks, use native DOM APIs
- **Modular Components**: Each action/feature is a separate module
- **ES6+ Features**: Use modern JavaScript (async/await, arrow functions, etc.)
- **CSS Custom Properties**: For theming and user customization
- **Chrome Extensions APIs**: Storage, tabs, windows, runtime messaging

### Common Patterns

```javascript
// DOM selection utility
function $(selector, parent = document) {
  return parent.querySelector(selector);
}

// Async messaging
async function projectText(text, markdown = false, index) {
  return chrome.runtime.sendMessage({
    action: "updateText",
    payload: { text, markdown, index }
  });
}

// Event handling with debouncing
const debouncedHandler = debounce(async win => {
  // Handle window changes
}, 500);
```

### File Organization

- Each UI action has its own file in `views/main/actions/`
- Bible-specific logic in `views/bibles/bible.com/`
- Shared utilities in `views/common/`
- CSS follows BEM-like conventions with component-specific files

## Technical Constraints

### Chrome Extension Limitations

- **Manifest V3**: Service worker instead of background pages
- **Content Security Policy**: No inline scripts, use external files
- **Host Permissions**: Limited to bible.com domains
- **Storage Limits**: Use chrome.storage.sync for user preferences

### Bible.com Integration

- **DOM Selectors**: Use CSS class patterns (e.g., `[class^="ChapterContent_verse"]`)
- **Dynamic Content**: Handle async content loading with `waitElement()`
- **Multiple Versions**: Support parallel translations and language mappings

## User Interface Components

### Action Buttons

- **Project All** (💬): Toggle projection display
- **Settings** (🛠): Open settings window
- **Help** (❔): Show usage instructions
- **Pin Verses** (📌): Manage saved references

### Projection Features

- **Keyboard Navigation**: Arrow keys for verse navigation
- **Multi-select**: Ctrl+Click, Shift+Click for ranges
- **Fullscreen**: F11 for projection mode
- **Blank Screen**: ESC to hide content

### Settings System

- **Slide Master**: Multiple layout configurations
- **Background Images**: Upload and manage custom backgrounds
- **Typography**: Font size, color, shadow customization
- **Clock Display**: Configurable time display

## Testing Approach

### Test Structure

- `test/unit/`: Unit tests for individual functions
- `test/integration/`: End-to-end extension testing
- **Mock Objects**: Chrome APIs mocked for testing
- **Bible Mappings**: Translation accuracy tests

### Key Test Areas

- Bible verse mapping between translations
- Chrome runtime message handling
- Storage synchronization
- DOM selector reliability

## Common Development Tasks

### Adding New Features

1. Create component file in appropriate `views/` subdirectory
2. Add to manifest.json if new permissions needed
3. Update `views/main/index.js` for content script integration
4. Add corresponding tests

### Bible.com Updates

1. Update selectors in `views/bibles/bible.com/selectors.js`
2. Test across different Bible versions/languages
3. Update mappings in `views/common/bible-mappings.js`

### UI Enhancements

1. Add CSS to component-specific files
2. Update `views/common/common.css` for shared styles
3. Use CSS custom properties for user customization
4. Ensure responsive design for projection windows

## Browser Compatibility

### Target Browser

- **Primary**: Google Chrome (latest stable)
- **Extension Store**: Chrome Web Store distribution
- **APIs**: Chrome Extension APIs (not WebExtensions standard)

### Key Dependencies

- Chrome Storage API for settings persistence
- Chrome Tabs/Windows API for projection management
- Chrome Runtime messaging for inter-window communication

## Build & Deployment

### Development Setup

```bash
npm install
# Load unpacked extension in Chrome developer mode
```

### Production Build

```bash
npm run deploy
# Creates build/{extension-name}-{version}.zip for Chrome Web Store
```

### Version Management

- Version synced between `package.json` and `manifest.json`
- Release notes maintained in `release-notes.md`
- Automated version bumping with `scripts/sync-version.js`

## Questions & Clarifications

When working on this codebase, prefer:

- Simple, readable JavaScript over complex abstractions
- Component-based organization over monolithic files
- Chrome Extension best practices for security and performance
- Accessibility considerations for church/presentation use
- Cross-translation Bible accuracy and mapping reliability

For any Chrome Extension API questions, window management, or Bible.com integration challenges, please ask for specific guidance based on the existing patterns in this codebase.
