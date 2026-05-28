const { getDb } = require('./db');
const { expandKeywords } = require('./synonyms');
const dotenv = require('dotenv');

dotenv.config();

// Simple Gemini Client - No complex SDK dependencies, using light raw fetch for reliability and speed
async function queryGeminiRerank(task, candidates) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ GEMINI_API_KEY not found in environment. Skipping AI Reranking.');
    return null;
  }

  // Format candidate metadata strictly to save tokens
  const payloadCandidates = candidates.map(c => ({
    path: c.path,
    name: c.name,
    symbols: c.symbols ? c.symbols.split(',').slice(0, 10) : [] // Limit symbols to save token context
  }));

  const systemPrompt = `You are a context navigation engine. Your job is to select the top 5-7 files from the candidate list that are absolutely critical for resolving the user's task.
Explain why each is selected in exactly 1 short sentence.
Output strictly JSON matching this structure:
{
  "selected": [
    {
      "path": "relative/path/to/file",
      "reason": "Short 1-sentence reason why it is selected."
    }
  ]
}`;

  const userPrompt = `Task: "${task}"
Candidates metadata: ${JSON.stringify(payloadCandidates)}
Select the top 5-7 files absolutely necessary to resolve this task. Explain why in 1 short sentence.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini request failed: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!contentText) return null;

    const result = JSON.parse(contentText);
    return result.selected || [];
  } catch (err) {
    console.error('Error calling Gemini API:', err);
    return null;
  }
}

async function executeQuery(task, improveWithAi = false) {
  const db = await getDb();

  // Find latest active scan
  const latestScan = await db.get('SELECT id, repo_path FROM scans WHERE status = "COMPLETED" ORDER BY scanned_at DESC LIMIT 1');
  if (!latestScan) {
    throw new Error('No completed codebase scan found. Please run "npm run scan <path>" first.');
  }

  const scanId = latestScan.id;
  
  // Total files in this scan
  const totalFilesObj = await db.get('SELECT COUNT(*) as count FROM files WHERE scan_id = ?', scanId);
  const totalFiles = totalFilesObj.count;

  // 1. Tokenize task and expand keywords
  const rawTokens = task.toLowerCase().split(/[\s,._\-\/]+/).filter(w => w.length >= 2);
  const keywords = expandKeywords(rawTokens);

  if (keywords.length === 0) {
    return {
      selectedFiles: [],
      prunedCount: totalFiles,
      reductionPercent: 100,
      totalFiles
    };
  }

  // 2. Keyword Filter (Deterministic query checking paths or symbols matching)
  // Build SQL parameterized checks dynamically
  const sqlConditions = [];
  const sqlParams = [];

  keywords.forEach(kw => {
    sqlConditions.push(`f.path LIKE ? OR s.name LIKE ?`);
    sqlParams.push(`%${kw}%`, `%${kw}%`);
  });

  // Always prepend the scan_id to filter correct scans
  const querySql = `
    SELECT f.id, f.path, f.name, GROUP_CONCAT(s.name) as symbols,
           (CASE WHEN f.path LIKE '%page%' OR f.path LIKE '%route%' THEN 2 ELSE 1 END) as priority
    FROM files f
    LEFT JOIN symbols s ON f.id = s.file_id
    WHERE f.scan_id = ? AND (${sqlConditions.join(' OR ')})
      AND f.path NOT LIKE '%clean_live_db%' AND f.path NOT LIKE '%db_init%'
    GROUP BY f.id
    ORDER BY priority DESC, f.name ASC
    LIMIT 20
  `;

  const primaryCandidates = await db.all(querySql, scanId, ...sqlParams);
  
  // 3. BFS Dependency Traversal (1-hop import edges)
  const candidateIds = primaryCandidates.map(c => c.id);
  let neighbors = [];
  if (candidateIds.length > 0) {
    const placeholders = candidateIds.map(() => '?').join(',');
    
    // Find files imported BY candidates or files importing candidates
    const neighborQuery = `
      SELECT DISTINCT f.id, f.path, f.name, 'DEPENDENCY' as role
      FROM files f
      JOIN edges e ON (f.id = e.target_file_id AND e.source_file_id IN (${placeholders}))
                  OR (f.id = e.source_file_id AND e.target_file_id IN (${placeholders}))
      WHERE f.scan_id = ? AND f.id NOT IN (${placeholders})
      LIMIT 10
    `;
    
    neighbors = await db.all(
      neighborQuery, 
      ...candidateIds, 
      ...candidateIds, 
      scanId, 
      ...candidateIds
    );
  }

  // Merge primary candidates and neighboring file dependencies
  const combinedCandidates = [...primaryCandidates];
  const seenPaths = new Set(primaryCandidates.map(c => c.path));

  neighbors.forEach(n => {
    if (!seenPaths.has(n.path)) {
      combinedCandidates.push({
        id: n.id,
        path: n.path,
        name: n.name,
        symbols: 'Dependency relation',
        isDependencyRelation: true
      });
      seenPaths.add(n.path);
    }
  });

  let selectedFiles = [];

  // 4. Decision Point: Check if optional Gemini reranking is enabled
  if (improveWithAi) {
    console.log(`🧠 Improving context analysis using Gemini 2.0 Flash...`);
    const aiSelected = await queryGeminiRerank(task, combinedCandidates);
    if (aiSelected && aiSelected.length > 0) {
      // Map AI choices back to our indexed databases to retain all symbol details
      const aiPathMap = new Map(aiSelected.map(item => [item.path, item.reason]));
      
      combinedCandidates.forEach(cand => {
        if (aiPathMap.has(cand.path)) {
          selectedFiles.push({
            path: cand.path,
            name: cand.name,
            reason: aiPathMap.get(cand.path),
            symbols: cand.symbols
          });
        }
      });
    }
  }

  // Fallback to deterministic local files list if AI is disabled or fails
  if (selectedFiles.length === 0) {
    selectedFiles = combinedCandidates.slice(0, 7).map((cand, idx) => ({
      path: cand.path,
      name: cand.name,
      symbols: cand.symbols,
      reason: cand.isDependencyRelation 
        ? `Import/Dependency relations of matched codebase components.` 
        : `Deterministic matches for query keywords: [${rawTokens.join(', ')}]`
    }));
  }

  const prunedCount = totalFiles - selectedFiles.length;
  const reductionPercent = totalFiles > 0 ? ((prunedCount / totalFiles) * 100).toFixed(2) : 0;

  return {
    selectedFiles,
    prunedCount,
    reductionPercent,
    totalFiles,
    candidatesForAi: combinedCandidates // Export preview of "What will be sent to AI"
  };
}

module.exports = {
  executeQuery
};
