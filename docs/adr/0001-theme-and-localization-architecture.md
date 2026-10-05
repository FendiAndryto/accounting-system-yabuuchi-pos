# Theme, Localization, and Iconography Architecture

We adopt client-side persisted Theme Mode (Light and Deep Slate Dark) and multi-language localization (ID, EN, JA) via dedicated React Contexts (`ThemeContext`, `LanguageContext`), replacing all emoji placeholders with soft-toned Feather vector icons.

### Context & Decision
The application requires seamless light/dark mode support and multi-language UI translation (Indonesian, English, Japanese) for international team members, alongside replacing loud emoji glyphs with professional corporate iconography. We decided to:
1. Store theme and language preferences in client storage (`localStorage` / `AsyncStorage`) so preferences apply instantly across sessions and login screens without network overhead.
2. Utilize Deep Slate / Navy `#0f172a` as the dark theme foundation to retain legibility for accounting tables and financial figures.
3. Standardize on `@expo/vector-icons` Feather outlines with muted slate colors (`#64748b` in light, `#94a3b8` in dark) and brand-tinted accents.
4. Adapt currency display dynamically to the active locale converted from the accounting IDR base: Indonesian Rupiah (`Rp`), US Dollar (`$`) using reference conversion (`1 USD ≈ Rp 16,000`), and Japanese Yen (`¥`) using reference conversion (`1 JPY ≈ Rp 105`). Data entry and storage remain in IDR.
5. Provide immediate access controls in the Header bar for quick toggling.
