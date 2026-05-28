const fs = require('fs');
const path = require('path');
const { initDb } = require('../lib/db');
const { parseImports, parseSymbols } = require('../lib/parser');

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
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    let stat;
    try {
      stat = fs.statSync(fullPath);
    } catch (e) {
      continue; // skip broken symlinks or unreadable files
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

// Map relative paths from ESM / CommonJS imports to actual project files
function resolveImportPath(sourceFileRelative, importString, allFilesPaths) {
  // Ignore external package imports (e.g. 'react', 'next/router', 'sqlite3')
  if (!importString.startsWith('.') && !importString.startsWith('/')) {
    return null;
  }

  const sourceDir = path.dirname(sourceFileRelative);
  let resolvedRelative = path.normalize(path.join(sourceDir, importString));

  // Try checking possible variations
  const extensions = ['', '.js', '.jsx', '.ts', '.tsx', '.json', '.mjs', '.cjs'];
  for (const ext of extensions) {
    const checkPath = resolvedRelative + ext;
    if (allFilesPaths.has(checkPath)) return checkPath;
    
    // Check if it's a folder importing index.js/index.ts
    const indexPath = path.normalize(path.join(resolvedRelative, `index${ext}`));
    if (allFilesPaths.has(indexPath)) return indexPath;
  }

  return null;
}

async function run() {
  const targetDirInput = process.argv[2];
  if (!targetDirInput) {
    console.error('Usage: npm run scan <target-directory-path>');
    process.exit(1);
  }

  const targetDir = path.resolve(targetDirInput);
  if (!fs.existsSync(targetDir)) {
    console.error(`Error: Target directory does not exist: ${targetDir}`);
    process.exit(1);
  }

  console.log(`🌌 CodeGalaxy: Starting scanner on: ${targetDir}`);
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
  console.log(`Found ${scannedFiles.length} matching code/text files.`);

  // Insert files and symbols
  const fileIdMap = new Map(); // relativePath -> fileId
  const allFilesPaths = new Set();

  for (const file of scannedFiles) {
    const relativePath = path.relative(targetDir, file.absolutePath);
    const fileId = 'file_' + Math.random().toString(36).substr(2, 9);
    fileIdMap.set(relativePath, fileId);
    allFilesPaths.add(relativePath);

    // Read content
    let content = '';
    try {
      content = fs.readFileSync(file.absolutePath, 'utf8');
    } catch (err) {
      console.warn(`Warning: Could not read ${file.absolutePath}`);
    }

    // Insert file
    await db.run(
      'INSERT INTO files (id, scan_id, path, name, size_bytes) VALUES (?, ?, ?, ?, ?)',
      fileId,
      scanId,
      relativePath,
      file.name,
      file.size
    );

    // Parse symbols
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

  // Parse import edges
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

  // Finalize scan record
  await db.run(
    'UPDATE scans SET status = ? WHERE id = ?',
    'COMPLETED',
    scanId
  );

  console.log(`✨ Scan completed successfully!`);
  console.log(`Indexed:`);
  console.log(`- ${scannedFiles.length} files`);
  console.log(`- ${edgeCount} import/dependency edges`);
  console.log(`Database saved successfully.`);
}

run().catch(err => {
  console.error('Scan process failed:', err);
  process.exit(1);
});
