const fs = require('fs');
const path = require('path');
const { initDb } = require('../../lib/db');
const { parseImports, parseSymbols } = require('../../lib/parser');

// Core excluded/ignored folders & file matches
const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  '.vercel',
  'dist',
  'build',
  'coverage',
  'public',
  'out'
]);

const IGNORE_FILES = new Set([
  '.env',
  '.env.local',
  '.env.production',
  '.env.development',
  'codegalaxy.db',
  '.DS_Store',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml'
]);

// Handled extensions
const ALLOWED_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.json',
  '.md',
  '.mjs',
  '.cjs'
]);

function shouldIgnore(name, isDir) {
  if (isDir) {
    return IGNORE_DIRS.has(name);
  }
  if (IGNORE_FILES.has(name)) return true;
  if (name.startsWith('.env')) return true;
  return false;
}

function getFilesRecursive(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    let stat;
    try {
      stat = fs.statSync(fullPath);
    } catch (e) {
      continue;
    }

    const isDir = stat.isDirectory();
    if (shouldIgnore(file, isDir)) continue;

    if (isDir) {
      getFilesRecursive(fullPath, fileList);
    } else {
      const ext = path.extname(file);
      if (ALLOWED_EXTENSIONS.has(ext)) {
        fileList.push({
          absolutePath: fullPath,
          name: file,
          size: stat.size
        });
      }
    }
  }
  return fileList;
}

function resolveImportPath(sourceFileRelative, importString, allFilesPaths) {
  if (!importString.startsWith('.') && !importString.startsWith('/')) {
    return null;
  }

  const sourceDir = path.dirname(sourceFileRelative);
  let resolvedRelative = path.normalize(path.join(sourceDir, importString));

  const extensions = ['', '.js', '.jsx', '.ts', '.tsx', '.json', '.mjs', '.cjs'];
  for (const ext of extensions) {
    const checkPath = resolvedRelative + ext;
    if (allFilesPaths.has(checkPath)) return checkPath;
    
    const indexPath = path.normalize(path.join(resolvedRelative, `index${ext}`));
    if (allFilesPaths.has(indexPath)) return indexPath;
  }

  return null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { repoPath } = body;

    if (!repoPath) {
      return Response.json({ error: 'Repository path is required.' }, { status: 400 });
    }

    const targetDir = path.resolve(repoPath);
    if (!fs.existsSync(targetDir)) {
      return Response.json({ error: `Directory does not exist: ${repoPath}` }, { status: 400 });
    }

    const db = await initDb();

    // Create scan record
    const scanId = 'scan_' + Date.now();
    await db.run(
      'INSERT INTO scans (id, repo_path, status) VALUES (?, ?, ?)',
      scanId,
      targetDir,
      'RUNNING'
    );

    const scannedFiles = getFilesRecursive(targetDir);

    const fileIdMap = new Map();
    const allFilesPaths = new Set();

    for (const file of scannedFiles) {
      const relativePath = path.relative(targetDir, file.absolutePath);
      const fileId = 'file_' + Math.random().toString(36).substr(2, 9);
      fileIdMap.set(relativePath, fileId);
      allFilesPaths.add(relativePath);

      let content = '';
      try {
        content = fs.readFileSync(file.absolutePath, 'utf8');
      } catch (err) {
        // Skip unreadable files
      }

      await db.run(
        'INSERT INTO files (id, scan_id, path, name, size_bytes) VALUES (?, ?, ?, ?, ?)',
        fileId,
        scanId,
        relativePath,
        file.name,
        file.size
      );

      const symbols = parseSymbols(content);
      for (const sym of symbols) {
        const symId = 'sym_' + Math.random().toString(36).substr(2, 9);
        await db.run(
          'INSERT INTO symbols (id, file_id, name, type, line_start) VALUES (?, ?, ?, ?, ?)',
          symId,
          fileId,
          sym.name,
          sym.type,
          sym.line
        );
      }
    }

    let edgeCount = 0;
    for (const file of scannedFiles) {
      const relativePath = path.relative(targetDir, file.absolutePath);
      const sourceFileId = fileIdMap.get(relativePath);

      let content = '';
      try {
        content = fs.readFileSync(file.absolutePath, 'utf8');
      } catch (err) {
        continue;
      }

      const imports = parseImports(content);
      for (const imp of imports) {
        const resolvedTargetRelative = resolveImportPath(relativePath, imp, allFilesPaths);
        
        const edgeId = 'edge_' + Math.random().toString(36).substr(2, 9);
        const targetFileId = resolvedTargetRelative ? fileIdMap.get(resolvedTargetRelative) : null;

        await db.run(
          'INSERT INTO edges (id, scan_id, source_file_id, target_file_path, target_file_id) VALUES (?, ?, ?, ?, ?)',
          edgeId,
          scanId,
          sourceFileId,
          imp,
          targetFileId
        );
        edgeCount++;
      }
    }

    await db.run(
      'UPDATE scans SET status = ? WHERE id = ?',
      'COMPLETED',
      scanId
    );

    return Response.json({
      success: true,
      scanId,
      fileCount: scannedFiles.length,
      edgeCount
    });

  } catch (error) {
    console.error('Scan API error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
