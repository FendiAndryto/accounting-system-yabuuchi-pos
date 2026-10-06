# Mobile UI Optimization: 2-Row KPI Summary, Consistent Action Headers, and Edge-to-Edge AI Modal Takeover

We refine and optimize the mobile user experience across the Dashboard, Cash In/Out records, Ledger History, Team Management, and Floating AI Assistant.

### Context & Decision

Following initial responsive breakpoint adoption (ADR-0002), several mobile user experience friction points emerged during handheld device testing:

1. **Dashboard KPI Layout & Rate Clutter**:
   - On mobile (≤768px), KPI cards originally stacked vertically into 3 full-width rows, pushing key account balances far below the fold. Each card included redundant "Ref rate" benchmark strings.
   - We decided to restructure the mobile KPI grid into a 2-row layout: Row 1 displays **Cash In** and **Cash Out** side-by-side (50/50 split), and Row 2 displays **Net Flow** at 100% full width with its surplus/deficit badge.
   - We stripped the benchmark "Ref rate" label across all KPI cards to maximize visual clarity and prevent text clipping on narrow mobile screens.

2. **Cash In / Cash Out Record Vertical Spacing**:
   - On mobile, an excessive gap existed between the transaction input form card and the recent transaction card due to compounded card bottom margins and flex container expansion.
   - We eliminated the unnecessary bottom margin on the primary form card in mobile view and normalized the column gap to a compact 12px with zero flex growth (`flex: 0`).
   - We streamlined the amount input helper text to show only the essential IDR conversion preview when operating in foreign currency locales.

3. **History Ledger Summary Grid**:
   - The top ledger summary on the History screen previously relied on horizontal scrolling (`ScrollView horizontal`), which hid vital net flow numbers off-screen on mobile devices.
   - We replaced the horizontal scroll with a responsive 2x2 grid: Row 1 presents **Total Transactions** and **Net Flow**, while Row 2 presents **Cash In** and **Cash Out**, with clear horizontal and vertical dividers. Desktop continues to display the single-row 4-column overview.

4. **Team Management Action Bar Consistency**:
   - On mobile, the "Add User" button floated unpredictably below or beside the search input depending on screen width due to wrapping in a combined flex row with role filter chips.
   - We standardized the mobile action bar into two distinct rows: Row 1 pairs the search input with a compact "+ Tambah" button, while Row 2 houses the role filter chips (All, Admin, Staff).

5. **AI Assistant Modal Mobile Fullscreen Takeover**:
   - The AI Assistant modal previously inherited `maxHeight: calc(100vh - 105px)` on mobile, leaving a 105px gap at the bottom that exposed background content.
   - We resolved this by overriding `maxHeight: 100%`, `height: 100%`, `margin: 0`, and applying `position: fixed` for web mobile viewports. This creates an immersive edge-to-edge modal takeover with an enlarged close button and safe-area header padding.

### Considered Options

- **Dashboard KPI in 3-column scroll**: Rejected because horizontal swiping on mobile causes gesture collision with drawer swiping and hides net financial results.
- **Keeping Ref Rate in KPI subtext**: Rejected because static forex benchmark rates belong in currency settings/exchange documentation, not on primary high-frequency KPI cards.
- **Partial Bottom-Sheet for AI Assistant**: Rejected because mobile chat interactions require maximum vertical viewport height for typing without keyboard occlusion.
