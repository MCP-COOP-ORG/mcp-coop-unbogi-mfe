# 🤖 AI Navigation & Context Graph

> **Welcome, AI Agent!**
> This file is the **Root Node** of the Context Graph for the `mcp-coop-unbogi-mfe` monorepo.
> **DO NOT GUESS** architecture or implementation details. Follow this graph to gather accurate context before writing code.

## 🧭 How to Navigate the Codebase

This repository uses a decentralized **Context Graph** system to provide AI agents with precise, localized documentation.

**Your workflow should always be:**
1. Read this `GEMINI.md` file to understand the high-level topology.
2. Jump to the **Package Root Context** for the domain you are working on.
3. Follow the links inside the Package Root Context to reach **Sub-Contexts** (domain/folder-level documentation).
4. Read the specific source files mentioned in the sub-contexts.

---

## 📦 Workspace Topology & Context Roots

The monorepo consists of 4 tightly coupled packages. Choose the relevant package below and `view_file` its context entry point:

| Package | Role | Context Entry Point |
|---------|------|---------------------|
| **`@unbogi/contracts`** | Shared schemas, Zod validators, and wire types (Backend + Frontend). | [`packages/contracts/project-context-contracts.md`](packages/contracts/project-context-contracts.md) |
| **`@unbogi/firebase`** | Backend implementation: Cloud Functions, Repositories, Services. | [`packages/firebase/project-context-firebase.md`](packages/firebase/project-context-firebase.md) |
| **`@unbogi/shared`** | Frontend business logic: Zustand stores, API clients, Firebase init. | [`packages/shared/project-context-shared.md`](packages/shared/project-context-shared.md) |
| **`@unbogi/tma`** | Frontend UI: Telegram Mini App, React components, animations. | [`packages/tma/project-context-tma.md`](packages/tma/project-context-tma.md) |

---

## 🧱 Dependency Flow

Understanding the dependency direction is critical. Packages must strictly follow this hierarchy (top depends on bottom):

```
[ Frontend: @unbogi/tma ]
          │ (consumes)
          ▼
[ Frontend Logic: @unbogi/shared ]    [ Backend: @unbogi/firebase ]
          │                                  │
          └────────────► [ @unbogi/contracts ] ◄────────────┘
                            (Wire Schemas)
```

**Anti-patterns (DO NOT DO THIS):**
- ❌ `@unbogi/tma` importing directly from `@unbogi/contracts` (it must go through `shared`).
- ❌ `@unbogi/shared` importing from `@unbogi/firebase`.
- ❌ Frontend code directly calling Firebase Admin SDKs.
- ❌ Duplicating interfaces that should be in `@unbogi/contracts`.

---

## 🚀 Execution Rules for AI

1. **Context First:** Always read the relevant `project-context-*.md` files when entering a new package or directory.
2. **Respect Boundaries:** Maintain strict isolation between UI (`tma`), Client Logic (`shared`), and Server Logic (`firebase`).
3. **Use the Barrel Pattern:** Imports between packages and major modules should always go through `index.ts` barrel files.
4. **KISS & DRY:** Check existing context files for utilities or patterns before writing new ones.
