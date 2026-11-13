# Board & Workspace Feature Specification

## 1. Current State

- **Dual View Mode**: Center tab switcher (Whiteboard / Document) using shadcn `Tabs`. State managed via `activeTab` and propagated between `WorkspaceHeader` and `WorkspaceView`.
- **Custom Floating Toolbar**: Custom elevating toolbar with vibrant tool colors, hover/scale effects, and imperative tool dispatching (`selection`, `rectangle`, `diamond`, `ellipse`, `arrow`, `line`, `freedraw`, `text`, `eraser`, `frame`, `hand`).
- **Contextual Floating Element Properties**: Dynamic floating toolbar (`FloatingToolBar.tsx`) positioned above selected elements with type indicators, layer reordering (Bring front, Send back), stroke/fill quick pickers, duplicate, lock, delete, and extended options (font/size/alignment for text; stroke style/width/opacity for shapes).
- **Dark Mode Sync**: Real-time theme synchronization between navbar `ThemeToggle` and Excalidraw canvas engine via `excalidrawAPI.updateScene()`. Canvas and application share unified deep dark tokens (`#121212` / `oklch(0.145 0 0)`).
- **CSS Customization**: Default Excalidraw toolbar, properties sidebar, top-left hamburger menu, and library button hidden via `whiteboard.css`.
- **Excalidraw Engine & Change-Triggered Auto-Save**: Interactive canvas integrated with `@excalidraw/excalidraw`. Changes are tracked via deterministic element signatures; auto-save triggers only after actual modifications with a 10-second debounce timer. Optimistic Concurrency Control (OCC) and self-healing schema creation run via `boardData` table (`elements`, `appState`, `files`, `version`, `updatedAt`) with toast notification feedback on sync.
- **AI Chatbot Popover & Docked Side Panel**: Miro-style AI assistant interface. Clicking bottom prompt bar triggers floating popover with "What are we solving today?" options, creation template cards grid (Generate Diagram, Flowchart, Architecture, Web Mockup, Mobile Mockup), and Software Architecture sidekick view. Transition button docks chat into persistent right-side panel with conversation timeline.
- **Document Mode**: In-app notes and documentation editor with formatting controls, auto-save feedback, and board reference.
- **Persistent Sidebar Navigation**: Clean sidebar drawer with Home, Starred, Browse, Search, and Spaces. Close button and toggle button remain visible and clickable across all desktop and mobile viewport states.
- **Dynamic Board Name Persistence**: Editable board name input with "Untitled" placeholder. Triggering rename automatically dispatches `POST /api/board` to upsert board record into Neon Postgres.
- **Dashboard Synchronization**: Recents section in `/dashboard` pulls real boards from Neon Postgres via `GET /api/board` with List/Grid toggle and dotted empty state. All logo and brand elements link back to `/dashboard`.
- **Profile Integration**: Direct Clerk `UserButton` in workspace header.
- **Architecture**: Strict multi-tiered backend flow (`API Route -> Controller -> Service -> Repository -> Database`).
- **Endpoints**:
  - `POST /api/board`: Saves / upserts board with authenticated Clerk user email.
  - `GET /api/board`: Retrieves all user boards (for dashboard list/grid view).
  - `GET /api/board?boardId=...`: Retrieves single board metadata.
  - `POST /api/board/data`: Auto-saves / upserts canvas elements, layout appState, and embedded binary files into `boardData` with OCC version check.
  - `GET /api/board/data?boardId=...`: Retrieves persisted canvas elements, appState, and files for a board.

## 2. Data Flow

1. **Board Navigation & View Switching**:
   - User opens `/workspace` → redirected to unique `/workspace/[boardId]`.
   - Client loads existing board title via `GET /api/board?boardId=[boardId]` or defaults to "Untitled".
   - `Whiteboard` queries `GET /api/board/data?boardId=[boardId]` to hydrate previous canvas state.
   - Center header tabs switch `activeTab` between `"whiteboard"` (`<Whiteboard />`) and `"document"` (`<Document />`).
2. **Change-Triggered Auto-Save (10s Debounce)**:
   - User alters elements on Excalidraw canvas.
   - `handleCanvasChange` compares element signature against `lastSavedSigRef`.
   - If changed: clears previous timer and schedules fresh 10s debounce timer.
   - After 10s of inactivity: dispatches `POST /api/board/data` with `{ boardId, elements, appState, files, version }`.
   - `BoardController.handleSaveBoardData` verifies Clerk session and catches conflicts.
   - `BoardService.saveBoardData` ensures parent `boards` record exists and delegates to `BoardRepository.upsertBoardData`.
   - `BoardRepository` auto-ensures table readiness, compares OCC version, bumps version, and updates timestamp.
   - Success toast displays updated version.
3. **Rename & Save**:
   - User clicks board title in `WorkspaceHeader`, edits text, and presses Enter or blurs.
   - Dispatches `POST /api/board` with `{ boardId, name }`.
   - `BoardController` extracts email from Clerk session (`currentUser()`).
   - `BoardService` invokes `BoardRepository.upsertBoard()`.
   - Drizzle persists board row in Neon DB and returns updated model.
   - Header shows visual checkmark feedback.
4. **Sidebar Toggle**:
   - `isSidebarOpen` toggled via header button or sidebar close button.
   - Header shifts left offset dynamically so controls never get covered.
5. **Dashboard Fetching & Recency Sorting**:
   - `/dashboard` mounts `RecentsSection`.
   - Calls `GET /api/board` to fetch boards sorted by `COALESCE(boardData.updatedAt, boards.createdAt) DESC`.
   - Board edited most recently appears at the top.
   - Timestamps format dynamically ("Today" for same-day edits, "MMM D" otherwise).
   - If count > 0, renders grid/list cards linking to `/workspace/[boardId]`. If 0, renders empty dotted state with Create button.

## 3. Future Improvements

- Live collaborative cursor sync with WebSockets / Liveblocks.
- S3 image asset offloading for high-res canvas media.
