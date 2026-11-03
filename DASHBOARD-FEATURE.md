# Dashboard Feature Specification

## 1. Current State
- **Layout & Structure**: Built using shadcn/ui `SidebarProvider`, `Sidebar`, `SidebarInset`, and responsive header navbar.
- **Dynamic Greeting**: Time-sensitive greeting (`Good morning`, `Good afternoon`, `Good evening`) combined with authenticated user identity via Clerk (`useUser`).
- **Templates Section**: Displays 3 template placeholder cards ("Blank board" with quick create icon, "AI Playground" with mock sidekick pill, and "Flowchart").
- **Recent Items Section**: Interactive table and grid view toggling displaying recent board items with mock metadata (last opened, owner, activity state).
- **Theming**: Default light theme with full dark theme support powered by `next-themes` and CSS variable definitions.

## 2. Data Flow
1. **Authentication Check**:
   - `app/dashboard/layout.tsx` calls `await auth.protect()` to guard access on the server.
   - Unauthenticated visitors are routed to `/sign-in`.
2. **User Identity & State**:
   - `GreetingHeader` reads client auth context from Clerk (`useUser()`).
   - Retrieves `firstName` or `fullName` for greeting display.
3. **Theming Flow**:
   - `ThemeProvider` manages class attribute on `<html>` (`class="dark"`).
   - `ThemeToggle` toggles between light and dark modes without layout shift.
4. **Recent Boards**:
   - Currently rendered with frontend state and placeholder records.

## 3. Future Improvements
- Connect `RecentBoards` list to Drizzle ORM repository layer (`boards` table).
- Implement board creation handler on "Blank board" and "Create" button clicks.
- Add real-time online presence indicators using WebSocket / Liveblocks / Inngest.
- Support workspace and space creation modals.

