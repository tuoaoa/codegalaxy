const { executeQuery } = require('../lib/queryEngine');

async function run() {
  const queryText = process.argv[2];
  if (!queryText) {
    console.error('Usage: npm run query "<search-task-query>" [--ai]');
    process.exit(1);
  }

  const improveWithAi = process.argv.includes('--ai');

  console.log(`🔍 CodeGalaxy: Querying active context engine for: "${queryText}"`);
  console.log(`AI Reranker is: ${improveWithAi ? 'ON (Gemini)' : 'OFF (Local Deterministic Only)'}`);

  try {
    const results = await executeQuery(queryText, improveWithAi);

    console.log('\n================================================================');
    console.log('📊 CONTEXT REDUCTION METRICS');
    console.log('================================================================');
    console.log(`Total files in codebase:       ${results.totalFiles}`);
    console.log(`Files recommended to read:     ${results.selectedFiles.length}`);
    console.log(`Files not selected for this task: ${results.prunedCount} (${results.reductionPercent}%)`);
    console.log('================================================================');

    console.log('\n📋 Metadata reasoning fields preview (matchType & matchedTerms):');
    results.selectedFiles.forEach((file, idx) => {
      console.log(`  ${idx + 1}. [${file.path}]`);
      console.log(`     - matchType: ${file.matchType}`);
      console.log(`     - matchedTerms: [${(file.matchedTerms || []).join(', ')}]`);
      if (file.dependencyFrom) {
        console.log(`     - dependencyFrom: ${file.dependencyFrom}`);
      }
    });

    console.log('\n📝 CLEAN BOOTSTRAP PROMPT GENERATOR:');
    console.log('----------------------------------------------------------------');
    const filesList = results.selectedFiles
      .map((f, i) => `${i + 1}. ${f.path} — ${f.shortReason}`)
      .join('\n');

    const cleanPrompt = `Task: ${queryText}
Read ONLY these files first:
${filesList}

Do not scan the full repo unless these files are insufficient.
After reading, explain whether more files are needed.`;

    console.log(cleanPrompt);
    console.log('----------------------------------------------------------------');

  } catch (err) {
    console.error('Query execution failed:', err);
    process.exit(1);
  }
}

run();
