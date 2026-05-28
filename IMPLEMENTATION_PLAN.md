# 🌌 CodeGalaxy: AI Context Navigation Engine
## Technical Implementation Plan (Pivot v1 - Context-Engine-First)

This document details the step-by-step technical implementation for the **CodeGalaxy MVP**, pivoting from a visualization-first approach to a task-focused, semantic **Context Selection Engine**.

---

## 🏗️ 1. Database Architecture (SQLite Schema)
The SQLite schema is optimized for ultra-fast local indices, helping deterministic filters trim down thousands of files in milliseconds.

```sql
-- 1. Repository Scans Table
CREATE TABLE IF NOT EXISTS scans (
    id TEXT PRIMARY KEY,
    repo_path TEXT NOT NULL,
    scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'PENDING'
);

-- 2. Scanned Files Table
CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    scan_id TEXT REFERENCES scans(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    name TEXT NOT NULL,
    size_bytes INTEGER DEFAULT 0,
    summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_files_path ON files(scan_id, path);

-- 3. Code Symbols (Classes, Functions, Exports) Table
CREATE TABLE IF NOT EXISTS symbols (
    id TEXT PRIMARY KEY,
    file_id TEXT REFERENCES files(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- FUNCTION, CLASS, EXPORT
    line_start INTEGER,
    line_end INTEGER
);
CREATE INDEX IF NOT EXISTS idx_symbols_name ON symbols(name);

-- 4. Dependency Imports Table (Edges)
CREATE TABLE IF NOT EXISTS edges (
    id TEXT PRIMARY KEY,
    scan_id TEXT REFERENCES scans(id) ON DELETE CASCADE,
    source_file_id TEXT REFERENCES files(id) ON DELETE CASCADE,
    target_file_path TEXT NOT NULL, 
    target_file_id TEXT REFERENCES files(id) ON DELETE SET NULL, 
    type TEXT DEFAULT 'IMPORT'
);
```

---

## 🛠️ 2. The Hybrid Reranking Algorithm (`lib/queryEngine.js`)

Instead of utilizing expensive vector databases, CodeGalaxy implements a **deterministic first, semantic second** hybrid approach to query parsing.

```
                  ┌────────────────────────────────────────┐
                  │             USER QUERY                 │
                  │ ("why are unpaid invoices not syncing")│
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │      STEP 1: Deterministic Query       │
                  │   - Keyword match on file & symbol     │
                  │   - BFS dependency hops (1 & 2 levels) │
                  │   - Trims 2,400+ files -> Top 20       │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │        STEP 2: Cheap AI Rerank         │
                  │   - Send only Top 20 file paths +      │
                  │     symbol lists to Gemini 2.0 Flash   │
                  │   - Filters final Top 5-7 + Reasons    │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │          VISUAL SUBGRAPH               │
                  │   - Highlights Top 7 glowing nodes     │
                  │   - Fades out other 95% of galaxy      │
                  └────────────────────────────────────────┘
```

### Implementation Logic in `/api/query/route.js`:
```javascript
// Step 1: Local Deterministic Filtering
const keywords = queryText.toLowerCase().split(/\s+/).filter(w => w.length > 2);
let candidates = await db.all(`
  SELECT f.id, f.path, f.name, GROUP_CONCAT(s.name) as symbols
  FROM files f
  LEFT JOIN symbols s ON f.id = s.file_id
  WHERE ${keywords.map(() => `f.path LIKE ? OR s.name LIKE ?`).join(' OR ')}
  GROUP BY f.id
  LIMIT 30
`, ...keywords.flatMap(kw => [`%${kw}%`, `%${kw}%`]));

// 1-hop Dependency BFS Hops
const neighborIds = await db.all(`
  SELECT target_file_id FROM edges 
  WHERE source_file_id IN (${candidates.map(c => '?').join(',')})
`, ...candidates.map(c => c.id));
// Merge and trim candidates to top 20...

// Step 2: Metadata AI Reranking via Gemini
const rerankPrompt = `
Task: "${queryText}"
Candidates metadata: ${JSON.stringify(candidates)}
Select the top 5-7 files absolutely necessary to resolve this task. Explain why in 1 short sentence.
Return JSON format: { "selected": [{ "path": "path", "reason": "reason" }] }
`;
// Query Gemini 2.0 Flash Lite (cheap, fast, semantic)...
```

---

## 🎨 3. Task-Scoped UI & "Holy Shit" Metric Dashboard
* **Split View**:
  * **Left Panel**: 
    * Big **"Holy Shit" Metric Indicator**: `Pruned 99.71% of codebase. Avoided 2,430 files.`
    * Copy-pasteable Prompt Box containing direct file commands for Antigravity or Cline.
    * Active file inspection and custom reasoning display.
  * **Right Panel (Interactive SVG/Canvas Graph)**:
    * Instead of drawing all 2,400+ nodes, the visualizer **draws the selected cluster nodes in large, glowing dots**, and renders surrounding folder boundaries.
    * Non-relevant nodes are grouped into static "collapsed folder clusters" or completely faded (`opacity: 0.1`) to prevent canvas spaghetti clutters.

---

## 📅 4. Development Phases
1. **Phase 1: AST Scanner & SQLite Indexer**: Recursive folder scanner and index parser writing to `codegalaxy.db`.
2. **Phase 2: Hybrid Query Engine**: Keyword lookup + dependency BFS resolver + lightweight Gemini reranker.
3. **Phase 3: Dual-Panel UI Dashboard**: Centered around the context reduction metrics and copy-paste prompts.
4. **Phase 4: Task-Scoped Canvas Graph**: Node-link renderer optimized to draw clusters of interest with smooth hover interactions.
5. **Phase 5: Verification**: Test query *"sqlite helper"* on `qlynhatro` directory to verify context reduction ratio accuracy.
