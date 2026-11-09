# Board & Workspace Feature Specification

## 1. Current State

- **Dual View Mode**: Center tab switcher (Whiteboard / Document) using shadcn `Tabs`. State managed via `activeTab` and propagated between `WorkspaceHeader` and `WorkspaceView`.
- **Excalidraw Engine & Auto-Save**: Interactive infinite canvas integrated with `@excalidraw/excalidraw` (SSR-safe dynamic import). Changes are debounced and auto-saved to DB every 10 seconds via `boardData` table (`elements`, `appState`, `files`).
- **Document Mode**: In-app notes and documentation editor with formatting controls, auto-save feedback, and board reference.
- **Top Corner Toggleable Sidebar**: Sidebar drawer with Home, Starred, Browse, Search, Spaces, and team accounts toggled via the hamburger button.
- **Dynamic Board Name Persistence**: Editable board name input with "Untitled" placeholder. Triggering rename automatically dispatches `POST /api/board` to upsert board record into Neon Postgres.
- **Dashboard Synchronization**: Recents section in `/dashboard` pulls real boards from Neon Postgres via `GET /api/board` with List/Grid toggle and dotted empty state. All logo and brand elements link back to `/dashboard`.
- **Profile Integration**: Direct Clerk `UserButton` in workspace header.
- **Architecture**: Strict multi-tiered backend flow (`API Route -> Controller -> Service -> Repository -> Database`).
- **Endpoints**:
  - `POST /api/board`: Saves / upserts board with authenticated Clerk user email.
  - `GET /api/board`: Retrieves all user boards (for dashboard list/grid view).
  - `GET /api/board?boardId=...`: Retrieves single board metadata.
  - `POST /api/board/data`: Auto-saves / upserts canvas elements, layout appState, and embedded binary files into `boardData`.
  - `GET /api/board/data?boardId=...`: Retrieves persisted canvas elements, appState, and files for a board.

## 2. Data Flow

1. **Board Navigation & View Switching**:
   - User opens `/workspace` → redirected to unique `/workspace/[boardId]`.
   - Client loads existing board title via `GET /api/board?boardId=[boardId]` or defaults to "Untitled".
   - `Whiteboard` queries `GET /api/board/data?boardId=[boardId]` to hydrate previous canvas state.
   - Center header tabs switch `activeTab` between `"whiteboard"` (`<Whiteboard />`) and `"document"` (`<Document />`).
2. **Periodic Auto-Save (10s Debounce)**:
   - User draws or alters elements on Excalidraw canvas.
   - `handleCanvasChange` captures latest elements, appState, and files into refs.
   - Sets 10-second timer. After 10s of activity, dispatches `POST /api/board/data` with `{ boardId, elements, appState, files }`.
   - `BoardController.handleSaveBoardData` verifies Clerk session.
   - `BoardService.saveBoardData` ensures parent `boards` record exists, extracts safe appState layout keys, and delegates to `BoardRepository.upsertBoardData`.
   - Database updates `boardData` row; UI displays saving/saved badge indicator.
3. **Rename & Save**:
   - User clicks board title in `WorkspaceHeader`, edits text, and presses Enter or blurs.
   - Dispatches `POST /api/board` with `{ boardId, name }`.
   - `BoardController` extracts email from Clerk session (`currentUser()`).
   - `BoardService` invokes `BoardRepository.upsertBoard()`.
   - Drizzle persists board row in Neon DB and returns updated model.
   - Header shows visual checkmark feedback.
4. **Sidebar Toggle**:
   - `isSidebarOpen` state toggled from menu button in `WorkspaceHeader`.
   - Controls visibility of `WorkspaceSidebar`.
5. **Dashboard Fetching**:
   - `/dashboard` mounts `RecentsSection`.
   - Calls `GET /api/board`, sets boards list.
   - If count > 0, renders grid/list cards linking to `/workspace/[boardId]`. If 0, renders empty dotted state with Create button.

## 3. Future Improvements

- Live collaborative cursor sync with WebSockets / Liveblocks.
- S3 image asset offloading for high-res canvas media.
