# Full Localization: Multi-Currency Input, AI Prompt Localization, and Responsive Layout

We extend the existing client-side localization (ADR-0001) with three cross-cutting capabilities: locale-aware currency input that converts to IDR before storage, per-language AI system prompts for the Gemini assistant, and a responsive breakpoint system for mobile/tablet/desktop layouts.

### Context & Decision

The system already supports three Language Locales (ID, EN, JA) for UI labels and display-only currency conversion (ADR-0001). However, three gaps remained:

1. **Currency Input**: Users entering amounts were always working in IDR regardless of locale. We decided to let users input in their locale's native currency (USD for EN, JPY for JA) and convert to IDR before backend storage using the existing benchmark exchange rates. The form shows a live IDR conversion preview below the input. This avoids multi-currency storage complexity while feeling native.

2. **AI Assistant Language**: The Gemini system prompt and all local-engine fallback messages were hardcoded in Indonesian. We decided to maintain three fully-translated system prompts (ID, EN, JA) rather than a single prompt with a "respond in X" instruction, because a native-language system prompt produces significantly more natural output. The frontend sends the active `language` parameter with each chat API request.

3. **Database Text Localization**: Category names, account names, and payment methods stored in the database were always displayed in their original language. We decided to add optional `name_en` and `name_ja` Translation Columns to the `categories` and `accounts` tables, with fallback to the primary `name` column when empty. Transaction descriptions remain untranslated since they are freeform user input.

4. **Responsive Layout**: The app used fixed desktop-only layouts with no breakpoints. We adopted a two-breakpoint system: ≤768px triggers a hamburger drawer for mobile, 769–1024px shows a collapsed icon-only sidebar for tablet, and >1024px shows the full sidebar. The AI assistant uses a full-screen takeover on mobile instead of the floating popover.

### Considered Options

- **Currency storage**: Multi-currency records (store original + IDR) was rejected to avoid schema complexity for what is fundamentally a single-company IDR accounting system.
- **AI prompt**: A single Indonesian prompt with `"Respond in {language}"` injection was rejected because it produces unnatural mixed-language responses and fails to properly localize scope-boundary refusal messages.
- **DB text translation**: Auto-translation via Gemini API on category creation was rejected to avoid adding API dependency to simple CRUD operations.
- **Responsive**: A single breakpoint (mobile/desktop only) was rejected because tablet users on iPad benefit from the collapsed icon sidebar middle ground.
