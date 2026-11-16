# Feature Specification: AI Chatbot & Canvas Diagram Generator

## 1. Current State

- **Bottom Canvas Prompt Bar Visibility**: Controlled dynamically via `isChatOpen={chatMode !== "closed"}`. Bottom prompt bar hides whenever the popover or right sidebar is active; reappears immediately when closed. Zoom controls shift cleanly to avoid right sidebar overlap.
- **In-Panel "New Chat"**: Triggered via header or dropdown in right sidebar. Clears active chat history and resets sidekick without posting dummy messages. When empty, sidebar renders the full options panel directly.
- **AI Helper Creation (Pic 3)**:
  - 5 selectable creation templates (`generate-diagram`, `flowchart`, `architecture`, `web-mockup`, `mobile-mockup`) with purple border & indicator dot for active item.
  - "Describe your idea" prompt box with multiline textarea, selected template pill, and "Generate ↑" button.
  - Expandable inline API Key setup allowing users to enter and persist Gemini / OpenAI keys in client `localStorage`.
- **Canvas Generation Pipeline**:
  - `POST /api/ai/generate` API endpoint following clean architecture (`Route -> Controller -> Service -> External LLM`).
  - Places temporary loading rectangle placeholder on canvas at `getRightmostPlacementPosition` without replacing existing elements.
  - Replaces placeholder with final converted Excalidraw element skeletons upon successful generation.

## 2. Data Flow

```
User (UI)
  │
  ├─> Selects Creation Option (e.g. "flowchart")
  ├─> Enters Idea Prompt + Configures API Key (stored in localStorage)
  │
  ├─> Clicks "Generate ↑"
  │     │
  │     ├─> Whiteboard.tsx places AI placeholder rectangle at maxX + 80px
  │     │
  │     └─> POST /api/ai/generate { apiKey, provider, prompt, diagramType, position }
  │           │
  │           ├─> app/api/ai/generate/route.ts
  │           ├─> controllers/ai.controller.ts (Validates body & key)
  │           ├─> services/ai.service.ts (Selects prompt config, calls Gemini/OpenAI)
  │           └─> Returns { success: true, data: { elements: [...] } }
  │
  └─> Whiteboard.tsx:
        ├─> convertToExcalidrawElements(elements)
        ├─> replacePlaceholderWithGeneratedElements()
        ├─> excalidrawAPI.scrollToContent()
        └─> Updates chat message stream with success toast
```

## 3. Future Improvements

- Streaming element skeletons incrementally into Excalidraw canvas as tokens generate.
- Multi-diagram relational linkers that auto-wire arrows between previously generated frames and new frames.
- Support for custom local LLMs (Ollama / LMStudio / vLLM) via configurable base URLs.
