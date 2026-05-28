/**
 * Sleek and highly resilient AST-less regex parser for extracting
 * exports, functions, classes, and import edges from codebase files.
 */

function parseImports(content) {
  const imports = [];
  
  // ES Modules: import ... from 'path' or import 'path'
  // Regex captures from both single and double quotes, and handles multiline or named imports
  const esmRegex = /import\s+?(?:(?:(?:[\w*\s{},]*)\s+from\s+)?['"]([^'"]+)['"]|['"]([^'"]+)['"])/g;
  let match;
  while ((match = esmRegex.exec(content)) !== null) {
    const importPath = match[1] || match[2];
    if (importPath) imports.push(importPath);
  }

  // CommonJS: require('path')
  const cjsRegex = /require\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = cjsRegex.exec(content)) !== null) {
    if (match[1]) imports.push(match[1]);
  }

  // Dynamic import: import('path')
  const dynRegex = /import\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = dynRegex.exec(content)) !== null) {
    if (match[1]) imports.push(match[1]);
  }

  return [...new Set(imports)];
}

function parseSymbols(content) {
  const symbols = [];
  const lines = content.split('\n');

  // Detect exported named functions, classes, const/let/var, default exports
  // 1. Named functions: export function fnName(...) or function fnName(...)
  const fnRegex = /(?:export\s+)?function\s+([a-zA-Z0-9_$]+)\s*\(/;
  // 2. Arrow functions or standard variable assignments: const fnName = (...) => or let fnName = function(...)
  const varFnRegex = /(?:export\s+)?(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:\([^)]*\)|[a-zA-Z0-9_$]+)?\s*=>/;
  // 3. Classes: export class ClassName or class ClassName
  const classRegex = /(?:export\s+)?class\s+([a-zA-Z0-9_$]+)/;
  // 4. Directly exported constants/variables: export const foo = ...
  const exportVarRegex = /export\s+(?:const|let|var)\s+([a-zA-Z0-9_$]+)/;
  
  lines.forEach((line, idx) => {
    const lineNum = idx + 1;

    let match = fnRegex.exec(line);
    if (match && match[1]) {
      symbols.push({ name: match[1], type: 'FUNCTION', line: lineNum });
      return;
    }

    match = varFnRegex.exec(line);
    if (match && match[1]) {
      symbols.push({ name: match[1], type: 'FUNCTION', line: lineNum });
      return;
    }

    match = classRegex.exec(line);
    if (match && match[1]) {
      symbols.push({ name: match[1], type: 'CLASS', line: lineNum });
      return;
    }

    match = exportVarRegex.exec(line);
    if (match && match[1]) {
      symbols.push({ name: match[1], type: 'EXPORT', line: lineNum });
      return;
    }
  });

  return symbols;
}

module.exports = {
  parseImports,
  parseSymbols
};
