# 03: Soft Feather Iconography Migration Across Sidebar & Screens

**What to build:**
Replace all raw, saturated emoji icons (`📊`, `📁`, `💳`, `📜`, `👥`, `🏷️`, `✏️`, `🗑️`, `🚪`, `📅`) across the Sidebar, Header, and Screen action buttons with minimalist `@expo/vector-icons/Feather` icons styled with soft slate neutral colors and brand accents.

**Blocked by:** 01: Theme Provider, Deep Slate Dark Palette & Header Quick Toggle

**Status:** ready-for-agent

- [x] Sidebar icons converted to Feather icons (`bar-chart-2`, `folder`, `credit-card`, `file-text`, `users`, `log-out`)
- [x] Header icons converted to Feather icons (`calendar`, `refresh-cw`, `sun`, `moon`, `globe`)
- [x] Screen action buttons (Edit, Delete, Add, Search, Tag) converted to Feather icons (`edit-2`, `trash-2`, `plus`, `search`, `tag`)
- [x] Icon colors styled adaptively with theme tokens (soft slate when inactive, brand blue/emerald/rose when active)
