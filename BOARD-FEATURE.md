# Board Creation Feature Specification

## 1. Current State

- **Architecture**: Strict multi-tiered backend flow (`API Route -> Controller -> Service -> Repository -> Database`).
- **Endpoint**: `POST /api/board`.
- **Identity & Authentication**: Clerk server integration (`currentUser()`). Resolves user email dynamically on the server; rejects unauthenticated requests with 401.
- **Data Persistence**: Inserts new board into Neon Postgres via Drizzle ORM.
- **Default Business Logic**: Automatically generates unique UUID (`boardId`) and fallback board title ("Untitled Board") when not provided in request body. Links to internal `userId` when available.

## 2. Data Flow

1. **HTTP Request**:
   - Client sends `POST` request to `/api/board` with optional JSON body `{ "name": "Sprint Planning", "boardId": "optional-custom-id" }`.
2. **API Route (`app/api/board/route.ts`)**:
   - Forwards request directly to `BoardController.handleCreateBoard(req)`.
3. **Controller (`controllers/board.controller.ts`)**:
   - Calls Clerk `currentUser()` to verify session and extract `primaryEmailAddress`.
   - Parses request body and sanitizes parameters.
   - Forwards DTO `{ email, name, boardId }` to `BoardService`.
   - Formats final response as `NextResponse.json({ success, data }, { status: 201 })` or error status.
4. **Service (`services/board.service.ts`)**:
   - Enforces business rules (email requirement, auto-generating UUID `boardId`, default naming).
   - Resolves user profile from repository using email to obtain numeric `userId`.
   - Invokes `BoardRepository.insertBoard`.
5. **Repository (`repositories/board.repository.ts`)**:
   - Executes Drizzle SQL query: `db.insert(boards).values(...).returning()`.
   - Returns typed `Board` record to service layer.

## 3. Future Improvements

- Add rate limiting middleware (e.g. Upstash Redis) to throttle board creation spikes.
- Check user plan quota (e.g., limit free plan users to 5 boards) in `BoardService`.
- Implement `GET /api/board` to fetch all boards owned by the authenticated Clerk user.
- Add real-time canvas state initialization in S3/Neon object storage.
