# EXPLAIN these in simplest terms possible

# Whiteboard.tsx-

1. In Whiteboard.tsx ->
   - What is UI_OPTIONS ?
2. In use-canvas-autosave.ts ->
   1. what are the different elements in sanitizeElements and what do they specify?

   2. what is repairFractionalIndicesAndBindings? Explain the function in detail.

   3. From where does excalidrawAPIRef gets .current.getFiles(), .current.getAppState(), .curr.selectedElementIds[id] and how does this match with the functions of the original excalidraw api?

   4. how do filesRef, sceneFiles and latestDataRef.current.files store the files that I put in the canvas? Explain in detail the file storage mechanism and how to optimise to store large amount of files?

   5. What is the use of getCanvasSignature? Also what is appState?

   6. the api call to api/board/data , these are the DB calls-
      1. this.getboardById(dto.boardId)
      2. this.repository.findUserByEmail(dto.email)
      3. this.repository.upsertBoard -> this does 3DB calls -> for updating name - (why the name is being updated if already a function for renaming (`renameBoard`) exists?) and `db.update(boards)` and `db.update(boardData)`.
      - Why boardData needs to be updated when it already is existing and the board name is already updated in the `board` table in the `renameBoard` function?
      4. insertBoard(data) which also has this.ensureSchema? What is the use of this.ensureSchema? Why raw SQL? How to convert this into drizzle query? Also, why it is repeatedly used in upsertBoard and insertBoard?

      5. Why use cleanElements? Cant we use the existing sanitizeElements() function from use-canvas-autosave? Can this be used as a reusable fn?

      6. `this.repository.upsertBoardData()` which also has `findBoardDataByBoardId`, `db.update(boardData)` and `inserted = db.insert()`

      7. how to minimise these DB Calls and where likely to add cache or anything else to make this scalable?

   7. how does the version saving works? Which version gets saved?

   8. What part of this code file can be extracted into reusable functions?

   9. Which version gets saved if while the canvas state is getting saved, a new change is made ?

   10. Why is there a repeated `currentSig` in `scheduleAutoSave` check if it is already checked in `saveCanvasChanges`?

   11. Why 2 calls -> `findBoardById` and `findBoardsByUserEmail`? Why not only 1 of them is used?

   12. how does `excalidrawAPIRef.current.updateScene` Works?

3. Explain `useElementStyleDefaults` in absolute detail.

4. How to visually examine the number of database calls? Is there any observability software for this?

5. Explain repairFractionalIndicesAndBindings in detail

6. How many functions are implemented natively which can be replacced by excalidraw functions?

7. Explain selectedIds and if it is repeatedly used, find a way to remove the redundant code.

8. Explain all the useCallBacks
