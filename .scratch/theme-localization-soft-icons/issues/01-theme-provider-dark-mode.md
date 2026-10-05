# 01: Theme Provider, Deep Slate Dark Palette & Header Quick Toggle

**What to build:**
Enable toggling between Light and Deep Slate Dark mode (`#0f172a`) with instant persistence in local storage (`app_theme`), OS system preference detection fallback, and dynamic color token injection across all containers and text elements.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [x] ThemeContext created providing `{ theme, isDark, toggleTheme, colors }`
- [x] Light and Dark color palettes configured in `theme/index.js`
- [x] OS preference auto-detection (`prefers-color-scheme`) on first visit
- [x] Local storage persistence for theme mode
- [x] Theme toggle button in Header bar with Feather sun/moon icon
