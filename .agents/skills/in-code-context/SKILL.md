---
name: in-code-context
description: Enforce self-contained, unbloated in-code documentation. Mandates intention-revealing function and file names, top-of-file connection headers, function index comments, and strict prohibition of separate feature markdown docs.
---

# In-Code Context Skill

Embeds architectural and functional context directly inside the code without creating separate markdown documentation files. Eliminates documentation rot and repository bloat.

## Core Rules

### 1. Intention-Revealing Naming (Files & Functions)

- **File Names**: Use clear, descriptive names that reflect exact responsibility (e.g., `connector-geometry.ts`, `fractional-index-helper.ts`, `floating-text-options.tsx`). Avoid generic names like `utils.ts`, `helpers.ts`, or `misc.ts`.
- **Function Names**: Use explicit verb-noun pairs that describe exact behavior and return intent (e.g., `getShapeBorderAnchors`, `createDirectionalGhostConnection`, `repairFractionalIndicesAndBindings`). Never use ambiguous verbs like `process`, `handle`, `manage` when specific terms (`compute`, `validate`, `repair`, `manifest`) apply.

### 2. Top-of-File Architecture Header (Single Source of Truth)

At the very top of each source file, include a concise block comment containing:

1. **File**: Name of the file.
2. **Description**: 1-2 sentence summary of primary responsibility.
3. **Connects to**: Explicit list of files it connects to (imported dependencies, consuming callers, or related modules).
4. **Function Index**: Brief inline comment preceding each function defining its purpose and callers.

> [!IMPORTANT]
> **Single Explanation Rule**: Describe functions and files at the top/declaration point only. Do NOT repeat explanations, redundant inline comments, or walkthrough docs anywhere else.

#### Header Template (TypeScript / JavaScript):

```typescript
/**
 * File: connector-binding-helper.ts
 * Description: Manages creation, binding, and fractional index sanitation for directional shapes and connection arrows.
 * Connects to: connector-geometry.ts, magnetic-connector-overlay.tsx, fractional-index-helper.ts
 */

/**
 * Function: createDirectionalGhostConnection
 * Description: Manifests a solid connected shape and arrow in a given cardinal direction from source element.
 * Connects to: magnetic-connector-overlay.tsx
 */
export async function createDirectionalGhostConnection(...) { ... }
```

### 3. Zero-Bloat In-Code Context (No External Feature Markdown)

- **Do NOT create `.md` files for individual features**.
- The codebase must be self-documenting through precise names, types, and top-of-file headers.
- Keep repository free from stale, desynchronized markdown specs.
- Keep individual files focused and constricted to ~300 lines of code.
