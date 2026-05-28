# 🌌 CodeGalaxy: Minimal AI Context Navigation Engine
## Product Specification & MVP Plan (Pivot v1 - Context-Engine-First)

CodeGalaxy is a local-first **AI Context Navigation Engine**. Instead of acting as a "3D codebase visualization toy," CodeGalaxy's sole purpose is **Decision Assistance**: helping developers and AI coding agents isolate the absolute minimum set of files required for a specific coding task, eliminating context bloat and avoiding token waste.

---

## 🎯 Core Product Positioning & Value Pivot

```
❌ OLD: "Visual Code Graph" ──► Focus on smooth panning, zooming, and galaxy-wide rendering.
✅ NEW: "AI Context Engine" ──► Focus on context narrowing, semantic matching, and token reduction.
```

### The "Holy Shit" Metric: Context Reduction Ratio
The most critical metric in CodeGalaxy is **not FPS or nodes count**, but **Avoided Context**:
> 📊 **"Analyzed 2,438 files. Context pruned by 99.71%. Only 7 files recommended for this task."**

By displaying a dramatic, visual representation of how much garbage (irrelevant code, caches, third-party libraries) was avoided, CodeGalaxy demonstrates immediate ROI to developers looking to minimize LLM token costs and prevent AI agents from hallucinating.

---

## 🚀 The Hybrid Reranking Workflow (Fast & Cheap Semantic Retrieval)

To bypass the complexity of local Vector DBs and vector embedding syncs while maintaining high semantic accuracy for queries like *"why are unpaid invoices not syncing?"*, CodeGalaxy implements a **Two-Step Hybrid Retrieval Pipeline**:

```
[2,400+ Files]
      │
      ▼ (Step 1: Local Deterministic Filter)
[Top 20 Candidates]  <── 100% Local, SQLite-powered (Symbols, filename match, dependency hops)
      │
      ▼ (Step 2: Tiny AI Reranker)
[Final 5-7 Recommends] <── Cheap LLM Reranking on Top 20 METADATA only (Explain WHY they matter)
```

1. **Step 1: Local Deterministic Filtering (Free & Instant)**:
   * Perform rapid keyword, filename, symbol index matches and directory BFS hops on the local SQLite DB to trim down thousands of files into the **top 20 candidate files**.
2. **Step 2: Metadata AI Reranking (Cheap & Accurate)**:
   * Send **only the metadata** (file paths, symbols, imports, and task query) of the top 20 candidate files to a cheap LLM (Gemini 2.0 Flash / Flash-Lite).
   * The AI ranks the final **top 5-7 files** and generates a highly specific reasoning summary (e.g. *"This file handles the DB state updates that might block syncs"*).

---

## 🎨 Task-Scoped Subgraph (No Spaghetti Galaxy)
Whole-repo graphs inevitably turn into an unreadable spaghetti mess for large codebases. 
* CodeGalaxy defaults to a **Task-Scoped Subgraph**.
* The visual graph ONLY renders the localized neighborhood of the active task (e.g. `auth flow` only renders `middleware.js`, `auth.ts`, `session.js`, and `userModel.ts`).
* 95% of the rest of the codebase is faded out completely, ensuring immediate mental clarity in **under 30 seconds**.

---

## 🛠️ Required Functional Modules

### 1. AST Repo Scanner & Indexer
* Scan extensions: `.js`, `.ts`, `.jsx`, `.tsx`, `.json`, `.md`, `.cjs`, `.mjs`.
* Exclude folders: `node_modules`, `.git`, `.next`, `dist`, `build`, `.env*`.
* Store in SQLite: files, symbols (classes, functions, exports), imports/edges.

### 2. Hybrid Context Engine (The Core)
* **Keyword Filter**: Instant matching on filename, folders, and exported symbols.
* **Dependency Resolver**: 1-hop and 2-hop BFS imports lookup.
* **Metadata AI Reranker**: Lightweight API query using Gemini 2.0 Flash to rank top 20 candidates and write the "Why Selected" summaries.

### 3. Task-Scoped Visualizer
* Clean, 60fps canvas force-directed graph.
* Renders ONLY the task-scoped cluster.
* Gleaming node highlight and active dependency paths.

### 4. Prompt Export Panel
* Export optimal file paths and structure to clipboard.
* Prompt template formatted directly for Antigravity or Cline:
  `"You are working on: [Task]. ONLY read and edit these files: [File list]..."`
