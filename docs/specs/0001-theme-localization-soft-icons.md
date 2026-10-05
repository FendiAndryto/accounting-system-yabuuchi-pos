# Spec: Theme Mode (Light/Dark), Multi-Language Localization (ID/EN/JA), and Soft Iconography

## Problem Statement

Users of the AUBE TERRA accounting system face eye strain in low-light environments because the interface only supports a bright light theme. Furthermore, multinational team members and management cannot comfortably operate or audit the system because all labels and forms are solely in Indonesian with fixed IDR accounting formatting. Additionally, the existing UI relies on saturated, un-styled emoji glyphs for icons across the sidebar and screens, which look informal ("jreng") and clash with the corporate visual aesthetic.

## Solution

A cohesive presentation and localization overhaul consisting of:
1. **Two Theme Modes**: Clean Slate Light theme and Deep Slate / Navy Dark theme (`#0f172a`), with OS auto-detection and 1-click header toggle.
2. **Three-Language Localization (ID, EN, JA)**: Full UI localization for navigation, forms, tables, modals, and system alerts, with localized date formats and dynamic currency conversion (IDR `Rp`, USD `$`, JPY `¥`) using reference rates.
3. **Soft Corporate Iconography**: Complete transition from raw emojis to lightweight, minimalist Feather vector icons styled in soft slate tones and brand accents.

## User Stories

1. As a financial officer working at night, I want to switch to Dark Theme with one click, so that I can reduce eye strain while reviewing reports.
2. As a daytime user, I want the system to preserve my Light Theme preference, so that my viewing experience remains consistent across browser sessions.
3. As a first-time visitor whose operating system is set to dark mode, I want the application to automatically display in Dark Theme on initial load, so that my system preferences are honored immediately.
4. As an English-speaking stakeholder, I want to switch the interface language to English, so that I can understand navigation, table headers, and form inputs clearly.
5. As a Japanese executive or partner, I want to switch the interface language to Japanese, so that I can inspect ledger records, transaction history, and financial metrics in my native language.
6. As an English-speaking auditor, I want currency values to be presented in US Dollars ($) using a reference exchange rate when English is selected, so that financial figures are immediately understandable in an international denomination.
7. As a Japanese auditor, I want currency values to be presented in Japanese Yen (¥) using a reference exchange rate when Japanese is selected, so that amounts are presented in familiar numerical magnitude.
8. As an Indonesian accountant, I want currency values to remain in standard Indonesian Rupiah (Rp) formatting when Indonesian is selected, so that statutory accounting amounts are displayed accurately.
9. As a user creating transactions, I want the underlying transaction data entry and database records to remain in IDR regardless of the active display currency, so that financial ledger integrity is never corrupted by display conversions.
10. As a user viewing reports, I want dates in the header and tables to follow the active locale format (e.g. `2026年10月5日` for Japanese, `October 5, 2026` for English, and `5 Oktober 2026` for Indonesian), so that chronology is instantly legible.
11. As a user navigating the sidebar, I want clean, minimalist vector icons instead of loud emojis, so that the navigation feels professional and cohesive.
12. As a user interacting with action buttons (edit, delete, search, add), I want icons to have soft slate and brand-matched tints, so that visual cues are clear without being visually overwhelming.
13. As an administrator managing bank accounts and categories, I want all master data screen titles, buttons, placeholders, and action feedback to be fully translated into my chosen language.
14. As an unauthenticated user on the Login screen, I want the theme toggle and language selector to be functional, so that I can log in using my preferred theme and language.
15. As a user refreshing the browser or reopening the tab, I want my selected theme mode and language locale to persist in local storage, so that I do not have to reconfigure them every time.

## Implementation Decisions

- **Architecture & State Management**:
  - Two dedicated contexts: `ThemeContext` and `LanguageContext`, wrapping the application at the top level so theme tokens and translation functions are accessible everywhere.
  - Client-side persistence using `localStorage` / `AsyncStorage` (`app_theme` and `app_language`) for instantaneous hydration without backend latency or database schema changes.
- **Theme Palette**:
  - Light: Slate 50 background (`#f8fafc`), pure white card surfaces (`#ffffff`), Slate 200 borders (`#e2e8f0`), Slate 900 primary text (`#0f172a`).
  - Dark: Deep Slate / Navy background (`#0f172a`), Slate 800 card surfaces (`#1e293b`), Slate 700 borders (`#334155`), Slate 50 primary text (`#f8fafc`), Slate 400 muted text (`#94a3b8`).
- **Currency & Localization Mechanics**:
  - Base currency in database remains IDR.
  - Conversion helper applies reference benchmark rates when displaying amounts:
    - ID: `Rp` with Indonesian delimiter formatting (e.g., `Rp 16.000.000`).
    - EN: `$` with US delimiter formatting, converted at `1 USD ≈ Rp 16,000` (e.g., `$ 1,000.00`).
    - JA: `¥` with Japanese delimiter formatting, converted at `1 JPY ≈ Rp 105` (e.g., `¥ 152,380`).
- **Iconography**:
  - Standardized on Feather vector icons (`@expo/vector-icons/Feather`).
  - Default icon stroke color: `#64748b` in Light mode, `#94a3b8` in Dark mode; transitions to `#2563eb` / `#3b82f6` on active states.
  - Emoji glyphs removed from all screens, sidebar, header, and action buttons.
- **Controls & Placement**:
  - Header bar top-right hosts a Sun/Moon toggle button and a compact language selector pill (`ID` | `EN` | `JA`).
  - Login screen incorporates the same theme and language controls.

## Testing Decisions

- **Testing Philosophy**:
  - Test only external behavior at the highest seam: verify that changing locale or theme emits the correct visual tokens, translated string dictionary keys, formatted dates, and converted currency values.
  - Avoid testing internal implementation details such as private state variable names or internal style sheet object structures.
- **Primary Seam**:
  - The **Presentation & Localization Shell Seam** (`LanguageContext` translation helper + currency converter, and `ThemeContext` theme resolver).
- **Target Modules to Verify**:
  - Translation helper (`t()` string resolution across ID, EN, JA).
  - Currency conversion helper (`formatCurrency(amount, lang)`).
  - Date locale formatter (`formatDate(date, lang)`).
  - Theme mode resolution and storage persistence (`ThemeContext`).

## Out of Scope

- Backend database migration to store multi-currency exchange rate tables or multi-currency ledgers.
- Live real-time forex API integration (static reference rates are used for UI presentation).
- User-generated content translation (custom bank account names and user-written transaction notes remain in the original entered text).
- Additional languages beyond Indonesian, English, and Japanese.

## Further Notes

- Triage label: `ready-for-agent`
- Governed by [GLOSSARY.md](file:///c:/Users/pendi/Repository/AUBE%20TERRA%20INDONESIA/accounting-system/GLOSSARY.md) and ADR [0001-theme-and-localization-architecture.md](file:///c:/Users/pendi/Repository/AUBE%20TERRA%20INDONESIA/accounting-system/docs/adr/0001-theme-and-localization-architecture.md).
