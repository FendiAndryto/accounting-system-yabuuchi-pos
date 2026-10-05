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
