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

    console.log('\n📋 PREVIEW: What will be sent to AI (for semantic reranking):');
    results.candidatesForAi.forEach((cand, idx) => {
      console.log(`  ${idx + 1}. [${cand.path}]`);
    });

    console.log('\n🚀 Recommended files for AI to read:');
    results.selectedFiles.forEach((file, idx) => {
      console.log(`\n${idx + 1}. [${file.name}](file://${file.path})`);
      console.log(`   💡 Reason: ${file.reason}`);
    });

    console.log('\n📝 COPY-PASTE PROMPT FOR ANTIGRAVITY OR CLINE:');
    console.log('----------------------------------------------------------------');
    const filesList = results.selectedFiles.map((f, i) => `  ${i + 1}. [${f.name}](file://${f.path}) - ${f.reason}`).join('\n');
    const prompt = `You are working on the task: "${queryText}".
To minimize token costs and avoid hallucination, ONLY read and edit these recommended files:
${filesList}

Do not read other unselected files unless absolutely necessary.`;
    console.log(prompt);
    console.log('----------------------------------------------------------------');

  } catch (err) {
    console.error('Query execution failed:', err);
    process.exit(1);
  }
}

run();
