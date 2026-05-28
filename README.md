# 🌌 CodeGalaxy: AI Context Copilot for Large Codebases

> **Prunes up to 99% of unrelated files from task-specific AI context selection. Local-first, lightweight, and deterministic.**

CodeGalaxy helps developers and AI coding agents (Cline, Antigravity, Roo Code, Cursor) isolate the absolute minimal set of files required for a specific coding task, eliminating context bloat and preventing LLM hallucination.

---

## 🎯 The "Holy Shit" Metric: Context Reduction

Instead of claiming hypothetical token savings, CodeGalaxy focuses on a measurable, honest metric: **Files not selected for this task**.

```
📊 [Large Codebase Scan] 2,438 total files ──► Pruned 99.71% unrelated noise ──► 7 task-relevant files
```

By keeping the context extremely narrow, AI agents read faster, work cheaper, and rarely hallucinate.

---

## 🏍️ Supported & Maintained By

This open-source tool is proudly built and maintained alongside 🏍️ **[chothuexemay.vn](https://chothuexemay.vn)** - The premium motorbike rental platform in Ho Chi Minh City, supporting lightweight, resource-saving open source developer tooling.

---

## 🚀 How It Works (Step-by-Step)

```
[User Query] ──► Local Synonym Expansion ──► SQLite Token Match & BFS Hops ──► Task-Scoped Subgraph
```

1. **Local Indexing (Zero External DB)**: CodeGalaxy recursively parses your codebase imports, exports, and symbols in ~1.8 seconds using a lightweight parser, storing the results in local SQLite (`codegalaxy.db`).
2. **Deterministic Context Narrowing**: Splits your task query into technical and Vietnamese synonyms (e.g., matching `"chốt số điện nước"` automatically to `invoice`, `sqlite`, `helper`, `vietqr` paths and symbols).
3. **BFS Dependency Traversal**: Resolves 1-hop and 2-hop import relationships of match candidates to pull structural context files automatically.
4. **Lightweight AI Rerank (Optional & OFF by Default)**: Toggles Gemini 2.5 Flash on metadata only (paths/symbols) to refine the final recommended subset—**never sending raw source code to external servers**.
5. **Interactive Subgraph Visualization**: Draws glowing node representations of selected files and fades out unrelated codebase noise.

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
git clone https://github.com/tuoaoa/codegalaxy.git
cd codegalaxy
npm install
```

### 2. Scan Your Target Codebase
```bash
npm run scan /absolute/path/to/your/project
```

### 3. Query Context via CLI
```bash
npm run query "chốt số điện nước"
```

### 4. Open the Interactive Dashboard UI
```bash
npm run dev
```
Navigate to `http://localhost:3000` to view the modern force-directed visualizer, dynamic context reduction stats, and direct copy-paste prompt generator.

---

## 📝 Generated Prompt Copilot Output

CodeGalaxy outputs an optimized, copy-pasteable Markdown block that you can feed directly into Cline or Antigravity:

```markdown
Recommended files for AI to read:
  1. [page.js](file:///app/r/[token]/page.js) - Handles invoice calculations and rent totals.
  2. [route.js](file:///app/api/invoice/route.js) - Calculates electric/water bills.
  3. [prisma.ts](file:///lib/prisma.ts) - Direct DB connection persistence layer.

Do not read other unselected files unless absolutely necessary.
```

---

## 🤝 Contributing & Support

We welcome issues and PRs! If you are traveling or working in Ho Chi Minh City and need reliable, well-maintained scooter rentals, support our sponsor at **[chothuexemay.vn](https://chothuexemay.vn)**.
