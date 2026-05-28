import { executeQuery } from '../../../lib/queryEngine';
import { getDb } from '../../../lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { queryText, improveWithAi } = body;

    if (!queryText) {
      return Response.json({ error: 'Query text is required.' }, { status: 400 });
    }

    const results = await executeQuery(queryText, !!improveWithAi);

    // Dynamic Graph Building: Build task-scoped nodes and edges list for drawing in Canvas
    const db = await getDb();
    
    // Find latest scan
    const latestScan = await db.get('SELECT id FROM scans WHERE status = "COMPLETED" ORDER BY scanned_at DESC LIMIT 1');
    if (!latestScan) {
      return Response.json({ error: 'No scan found.' }, { status: 400 });
    }
    const scanId = latestScan.id;

    // Gather node IDs of selected files
    const selectedPaths = new Set(results.selectedFiles.map(f => f.path));
    
    // Gather all candidate nodes
    const graphNodes = [];
    const graphEdges = [];
    const seenNodeIds = new Set();

    // Map file paths to DB properties dynamically
    const allCandidates = results.candidatesForAi || [];
    
    // Convert to rich nodes for UI
    allCandidates.forEach(c => {
      const isSelected = selectedPaths.has(c.path);
      graphNodes.push({
        id: c.id,
        path: c.path,
        name: c.name,
        isSelected,
        isDependency: !!c.isDependencyRelation
      });
      seenNodeIds.add(c.id);
    });

    // 1-hop link edge queries to build precise lines in task-scoped graph
    if (seenNodeIds.size > 0) {
      const placeholders = Array.from(seenNodeIds).map(() => '?').join(',');
      const edgesQuery = `
        SELECT source_file_id, target_file_id, target_file_path 
        FROM edges 
        WHERE scan_id = ? 
          AND source_file_id IN (${placeholders}) 
          AND target_file_id IN (${placeholders})
      `;
      
      const DBEdges = await db.all(edgesQuery, scanId, ...Array.from(seenNodeIds));
      
      DBEdges.forEach(e => {
        graphEdges.push({
          source: e.source_file_id,
          target: e.target_file_id,
          label: e.target_file_path
        });
      });
    }

    return Response.json({
      ...results,
      graph: {
        nodes: graphNodes,
        edges: graphEdges
      }
    });

  } catch (error) {
    console.error('Query API error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
