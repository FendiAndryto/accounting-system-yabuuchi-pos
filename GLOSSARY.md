# Accounting System Context

Financial and management accounting system for AUBE TERRA INDONESIA operations, transaction auditing, and banking ledgers.

## Language

**Theme Mode**:
The visual color appearance of the user interface, toggled between Light (Slate 50) and Dark (Deep Slate/Navy `#0f172a`).
_Avoid_: Skin, display style, colorway.

**Language Locale**:
The active regional language translation applied to UI controls, labels, and system notifications, supporting Indonesian (`id`), English (`en`), and Japanese (`ja`).
_Avoid_: Translation mode, dialek, speech mode.

**Soft Icon**:
A minimalist vector outline icon (Feather/Lucide style) styled with subtle slate tones and brand-harmonized tints rather than saturated multi-color glyphs.
_Avoid_: Emoji icon, colorful sticker, 3D icon.

**Currency Formatting**:
The localized financial representation dynamically converted from base IDR into the active locale's currency: Rupiah (`Rp`) for ID, US Dollar (`$`) with benchmark exchange rate for EN, and Japanese Yen (`¥`) with benchmark exchange rate for JA.
_Avoid_: Hardcoded currency string, raw symbol swap without conversion.

**Cash In**:
Financial receipt or incoming operational revenue recorded into a specific bank or cash account.
_Avoid_: Pemasukan liar, credit-in.

**Cash Out**:
Financial disbursement or operational expenditure deducted from a specific bank or cash account.
_Avoid_: Pengeluaran bebas, debit-out.

**Locale Currency Input**:
User-facing amount entry in the active locale's native currency (IDR, USD, or JPY) that is converted to IDR before storage using a fixed benchmark exchange rate.
_Avoid_: Multi-currency storage, dual-amount record, raw forex input.

**Translation Column**:
An optional `name_en` / `name_ja` database column on lookup tables (categories, accounts) holding the localized display name. Falls back to the primary `name` column when empty.
_Avoid_: Auto-translation, runtime translation, i18n key reference.

**Responsive Breakpoint**:
A viewport-width threshold that triggers a layout shift: ≤768px (mobile — hamburger drawer), 769–1024px (tablet — collapsed icon sidebar), >1024px (desktop — full sidebar).
_Avoid_: Adaptive layout, fixed-width, mobile-only.

**AI Locale Prompt**:
A fully translated Gemini system instruction (ID, EN, or JA) that sets the AI assistant's language, personality, and scope constraints. Selected by the frontend's active Language Locale and sent with each chat request.
_Avoid_: Language hint, single-prompt-with-instruction, bilingual prompt.
