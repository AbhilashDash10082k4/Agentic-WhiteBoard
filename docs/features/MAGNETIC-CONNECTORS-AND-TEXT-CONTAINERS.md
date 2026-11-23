# Feature Specification: Magnetic Connectors, Ghost Connections & Shape Text Containers

## 1. Current State
- **Shape Text Containers**:
  - All shapes (`rectangle`, `diamond`, `ellipse`) automatically support integrated text containers with editable labels (`label: { text, fontSize, textAlign, verticalAlign }`).
  - Double-clicking any shape on canvas activates inline text editing via `ensureShapeTextContainer`.
  - Floating toolbar provides one-click Type button to edit labels on any selected shape.
- **Magnetic Connectors & Real-Time Sync**:
  - Four connection handles (top, bottom, left, right) positioned 14px outside shape boundaries when selected.
  - Live coordinates queried directly from `excalidrawAPI.getAppState()` and `excalidrawAPI.getSceneElements()`. Prevents coordinate drift, lag, and detachment during canvas pan/zoom.
  - Active drag suppression: handles immediately hide while dragging (`useIsMovingElement` + `liveAppState.draggingElement`), and reappear locked to the new shape position.
- **Directional Single-Click Concrete Shape Creation**:
  - Hovering on any handle displays directional arrow preview and ghost shape.
  - Clicking on any handle immediately spawns a solid concrete shape and bound connecting arrow without dragging.
  - Symmetrical geometry: new shape preserves source dimensions (`sw`, `sh`) with uniform 90px gap and centered collinear arrow.
  - Supports light mode default stroke (`#1e1e1e`), dark mode (`#f8fafc`), and accent color (`#6366f1`).
  - Focuses new shape text container and activates inline text editing immediately.
- **Linear Element Point Normalization**:
  - `normalizeLinearPoints`: Enforces Excalidraw's invariant that `points[0]` strictly equals `[0, 0]`, preventing `Linear element is not normalized` exceptions.

## 2. Data Flow
```
User (Pointer Event on Shape / Handle)
  │
  ├─> Moving shape on canvas:
  │     └─> liveAppState.draggingElement / useIsMovingElement hides handles
  │     └─> pointer release -> Excalidraw commits -> handles lock to live shape coordinates
  │
  ├─> Hovering on directional handle:
  │     ├─> Handle expands with directional icon
  │     └─> Renders ghost preview arrow and ghost shape at exact 90px gap
  │
  ├─> Single-Click on handle:
  │     ├─> onClick triggers createDirectionalGhostConnection
  │     ├─> converts [newShapeSkeleton, arrowSkeleton] via convertToExcalidrawElements
  │     ├─> updates sourceEl boundElements directly without re-converting
  │     ├─> normalizeLinearPoints ensures points[0] === [0, 0]
  │     └─> updates scene & activates inline text editing on new shape
  │
  └─> Dragging outward from handle:
        ├─> moves > 5px -> enters free drag mode
        ├─> snaps to target shape borders within 24px threshold
        └─> pointerup -> creates bound arrow connection
```

## 3. Future Improvements
- Multi-segment orthogonal elbow routing with obstacle avoidance.
- Color palette quick-selector for connector arrows and shape themes.
- Touch gesture enhancements for mobile tablet drawing.
