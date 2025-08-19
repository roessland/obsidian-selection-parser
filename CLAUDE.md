# CLAUDE.md

## Plugin Status: Completed ✅

**Plugin name:** "Selection Parser"
**Current functionality:**
- ✅ Automatically detects Unix timestamps in selected text (seconds or milliseconds)
- ✅ Displays parsed timestamps in ISO format in the status bar
- ✅ Click status bar to copy formatted timestamp to clipboard
- ✅ Configurable debug logging via plugin settings
- ✅ Performance optimized with debounced selection events
- ✅ Full test coverage with TypeScript tests

**Development cycle:**
- Make changes to TS files
- Run `npm run build`
- Run `npm test` for testing
- Test manually in Obsidian

**Recent changes:**
- Removed unnecessary sample commands
- Added clickable status bar with clipboard copying
- Implemented debug setting for optional console logging
- Clean UI with empty string instead of "N/A"
