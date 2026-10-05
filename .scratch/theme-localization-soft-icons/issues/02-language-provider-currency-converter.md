# 02: Language Provider, Tri-Lingual Dictionary (ID/EN/JA), Dynamic Currency Converter & Switcher

**What to build:**
Enable selecting between Indonesian (`id`), English (`en`), and Japanese (`ja`) with complete UI string translations, localized date formatting, dynamic currency conversion from IDR to USD ($) and JPY (¥) using reference rates, and local storage persistence (`app_language`).

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [x] LanguageContext created providing `{ language, setLanguage, t, formatCurrency, formatDate }`
- [x] Translation dictionaries for `id`, `en`, and `ja` covering sidebar, headers, forms, buttons, alerts, badges
- [x] Currency conversion helper converting base IDR to `Rp` (ID), `$` (EN, ~16,000 IDR), `¥` (JA, ~105 IDR)
- [x] Date formatting conforming to locale (`id-ID`, `en-US`, `ja-JP`)
- [x] Language selector pill/dropdown in Header bar
- [x] Persistence to local storage
