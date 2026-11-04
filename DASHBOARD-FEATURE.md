# Dashboard Feature Specification

## 1. Current State
- **Layout & Structure**: Built using shadcn/ui `SidebarProvider`, `Sidebar`, `SidebarInset`, and responsive header navbar.
- **Dynamic Greeting**: Time-sensitive greeting (`Good morning`, `Good afternoon`, `Good evening`) combined with authenticated user identity via Clerk (`useUser`).
- **Plan Usage & Progress**: Sidebar footer displays current plan tier ("Free plan"), usage metrics (e.g. `3 / 5 boards used`), and a golden gradient progress bar.
- **Animated Upgrade CTA**: Navbar and sidebar footer contain `AnimatedUpgradeButton` with continuous rotating warm golden conic-gradient borders.
- **Templates Section**: Displays 3 template placeholder cards ("Blank board" with quick create icon, "AI Playground" with mock sidekick pill, and "Flowchart"). Unaffected by board state.
- **Recent Items Section**: Interactive section with empty state fallback (rounded card with dotted border, `FolderOpen` icon, descriptive guidance, and `+ Create` button). Table/grid views automatically activate when board array contains records.
- **Theming**: Default light theme with full dark theme support powered by `next-themes` and CSS variable definitions.

## 2. Data Flow
1. **Authentication Check**:
   - `app/dashboard/layout.tsx` calls `await auth.protect()` to guard access on the server.
   - Unauthenticated visitors are routed to `/sign-in`.
2. **User Identity & State**:
   - `GreetingHeader` reads client auth context from Clerk (`useUser()`).
   - Retrieves `firstName` or `fullName` for greeting display.
3. **Recent Boards & Empty State Flow**:
   - `RecentsSection` accepts `boards` array prop (defaults to empty `[]`).
   - When empty, renders dotted border empty state with `FolderOpen` icon and `+ Create` trigger.
   - When populated, renders list table or grid cards based on active view mode toggle.
4. **Theming Flow**:
   - `ThemeProvider` manages class attribute on `<html>` (`class="dark"`).
   - `ThemeToggle` toggles between light and dark modes without layout shift.

## 3. Future Improvements
- Connect `RecentsSection` `boards` prop to Drizzle ORM query layer.
- Connect `onCreateBoard` callback to dialog modal or API board creation route.
- Implement board deletion and rename actions.
