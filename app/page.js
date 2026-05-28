'use client';

import { useState } from 'react';
import { 
  Folder, 
  Search, 
  Copy, 
  Check, 
  Cpu, 
  Zap, 
  Play, 
  RefreshCw,
  FileCode,
  ArrowRight,
  Sparkles,
  Info,
  Terminal,
  ShieldAlert,
  Flame,
  MousePointerClick
} from 'lucide-react';
import TaskScopedGraph from '../components/Graph';

export default function Home() {
  // Input settings states
  const [repoPath, setRepoPath] = useState('/Users/tuoaoa/Tuoaoa/devflow/qlynhatro');
  const [queryText, setQueryText] = useState('chốt số điện nước');
  const [improveWithAi, setImproveWithAi] = useState(false);

  // Status & Progress states
  const [isScanning, setIsScanning] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [queryResult, setQueryResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [copySuccess, setCopySuccess] = useState(''); // Stores 'cline' or 'anti' or 'minimal'

  // Trigger Scanner POST API call
  const handleScan = async () => {
    setIsScanning(true);
    setErrorMessage('');
    setScanResult(null);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoPath })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scan repository.');
      }

      setScanResult(data);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsScanning(false);
    }
  };

  // Trigger Query search POST API call
  const handleQuery = async () => {
    setIsQuerying(true);
    setErrorMessage('');
    setQueryResult(null);

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryText, improveWithAi })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process query search.');
      }

      setQueryResult(data);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsQuerying(false);
    }
  };

  // Copy structured prompt code optimized for Antigravity or Cline
  const handleCopyPrompt = (target) => {
    if (!queryResult || !queryResult.selectedFiles) return;

    const filesListStr = queryResult.selectedFiles
      .map((f, idx) => `${idx + 1}. ${f.path} — ${f.shortReason || f.reason}`)
      .join('\n');

    const promptText = `Task: ${queryText}
Read ONLY these files first:
${filesListStr}

Do not scan the full repo unless these files are insufficient.
After reading, explain whether more files are needed.`;

    navigator.clipboard.writeText(promptText);
    setCopySuccess(target);
    setTimeout(() => setCopySuccess(''), 2000);
  };

  // Format generated markdown prompt preview
  const getPromptPreview = () => {
    if (!queryResult || !queryResult.selectedFiles) return '';
    const list = queryResult.selectedFiles
      .map((f, i) => `${i + 1}. ${f.path} — ${f.shortReason || f.reason}`)
      .join('\n');
    return `Task: ${queryText}
Read ONLY these files first:
${list}

Do not scan the full repo unless these files are insufficient.
After reading, explain whether more files are needed.`;
  };

  return (
    <main className="min-h-screen bg-[#090b0d] text-gray-100 flex flex-col selection:bg-blue-600/30 selection:text-blue-300">
      
      {/* Top Header Bar */}
      <header className="border-b border-gray-800/60 bg-[#0d0f12]/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600/20 text-blue-500 border border-blue-500/30">
            <Zap className="w-5 h-5 absolute animate-pulse text-blue-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                CodeGalaxy
              </h1>
              <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono font-semibold">
                AI Task Copilot
              </span>
            </div>
            <p className="text-[10px] text-gray-500 font-mono">Pre-Context AI Task Bootstrap Engine</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs bg-gray-900 border border-gray-800 rounded-full px-3 py-1 text-gray-400">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
          <span>Preflight Gateway Active</span>
        </div>
      </header>

      {/* Main Grid: Preflight Mode (Left), Prompt Hub (Center), Reasoning & Graph (Right) */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-5 p-6 max-w-[1600px] mx-auto w-full">
        
        {/* COLUMN 1: Preflight Controls (width: 4/12) */}
        <section className="xl:col-span-4 flex flex-col space-y-5">
          
          {/* Repo Scanning Card */}
          <div className="glass-panel rounded-xl p-5 shadow-lg relative overflow-hidden">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-2 mb-3">
              <Folder className="w-4 h-4 text-blue-400" />
              <span>Target Local Repository</span>
            </h2>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={repoPath}
                  onChange={(e) => setRepoPath(e.target.value)}
                  placeholder="Enter path/to/your/repository"
                  className="flex-1 text-xs bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
                <button
                  onClick={handleScan}
                  disabled={isScanning}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {isScanning ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                  <span>{isScanning ? 'Scanning...' : 'Scan'}</span>
                </button>
              </div>

              {scanResult && (
                <div className="bg-blue-950/20 border border-blue-900/50 rounded-lg p-3 text-xs text-blue-300 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white">Scan Completed:</span>{' '}
                    <span>{scanResult.fileCount} files indexed.</span>
                  </div>
                  <span className="text-[10px] bg-blue-900/40 text-blue-200 border border-blue-800 px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Preflight Task Analysis Engine */}
          <div className="glass-panel rounded-xl p-5 shadow-lg flex-1 flex flex-col space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>Step 1: Task Preflight Setup</span>
            </h2>

            <div className="space-y-3">
              <label className="text-[10px] text-gray-500 font-mono uppercase block">Describe your coding goal</label>
              <textarea
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Describe what task/bug you want to resolve..."
                rows={4}
                className="w-full text-xs bg-gray-950 border border-gray-800 rounded-lg px-3 py-2.5 text-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
              />

              {/* Reranker Trigger */}
              <div className="flex items-center justify-between bg-gray-900/50 border border-gray-800/80 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Cpu className="w-4 h-4 text-indigo-400 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-gray-300">Improve with AI Rerank</div>
                    <div className="text-[10px] text-gray-500">Gemini 2.5 Flash Lite metadata filter.</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={improveWithAi}
                    onChange={(e) => setImproveWithAi(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white"></div>
                </label>
              </div>

              <button
                onClick={handleQuery}
                disabled={isQuerying}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold py-3 rounded-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shadow-md shadow-indigo-650/10"
              >
                {isQuerying ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{isQuerying ? 'Calculating minimal context...' : 'Bootstrap Task Context'}</span>
              </button>
            </div>

            {errorMessage && (
              <div className="bg-red-950/20 border border-red-900/50 text-red-400 rounded-lg p-3 text-xs font-mono">
                {errorMessage}
              </div>
            )}

            {/* Privacy Checkbox collapsible */}
            {queryResult && improveWithAi && (
              <details className="group border border-gray-800/80 bg-gray-900/30 rounded-lg text-xs overflow-hidden">
                <summary className="flex items-center justify-between p-3 font-semibold text-gray-400 cursor-pointer hover:bg-gray-800/30 transition select-none">
                  <div className="flex items-center space-x-1.5">
                    <Info className="w-3.5 h-3.5 text-indigo-400" />
                    <span>View Metadata Transmitted to AI</span>
                  </div>
                  <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="p-3 border-t border-gray-800/60 bg-gray-950/60 text-gray-500 max-h-[140px] overflow-y-auto font-mono text-[10px] space-y-1">
                  <p className="text-indigo-300 font-semibold mb-1">No raw code sent. Only pathways:</p>
                  {queryResult.candidatesForAi?.map((c, idx) => (
                    <div key={idx} className="truncate">
                      {idx + 1}. {c.path} ({c.name})
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        </section>

        {/* COLUMN 2: Prompt Copilot Output & Handoff Panel (width: 4/12) */}
        <section className="xl:col-span-4 flex flex-col space-y-5">
          
          {queryResult ? (
            <div className="glass-panel rounded-xl p-5 shadow-lg flex-1 flex flex-col space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-2">
                <MousePointerClick className="w-4 h-4 text-green-400" />
                <span>Step 2: Preflight Prompt Handoff</span>
              </h2>

              {/* Metric stats card */}
              <div className="bg-gray-950/50 border border-gray-850/80 p-3.5 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-gray-500 font-mono uppercase">Files not selected for this task</div>
                  <div className="text-base font-bold text-green-400 mt-0.5">
                    {queryResult.prunedCount} / {queryResult.totalFiles} ({queryResult.reductionPercent}% Pruned)
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-green-950/40 text-green-300 border border-green-900 px-2 py-0.5 rounded">
                  Optimized
                </span>
              </div>

              {/* Constrained Prompt Block Code View */}
              <div className="flex-1 flex flex-col space-y-2">
                <div className="text-[10px] text-gray-500 font-mono uppercase">Constrained AI Task Prompt</div>
                <div className="flex-1 bg-gray-950/80 border border-gray-850 rounded-lg p-3 text-[10px] font-mono text-gray-300 overflow-y-auto max-h-[350px] whitespace-pre-wrap leading-relaxed select-all">
                  {getPromptPreview()}
                </div>
              </div>

              {/* Handoff Trigger Action CTAs */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => handleCopyPrompt('cline')}
                  className="bg-gray-900 hover:bg-gray-850 border border-gray-800 rounded-lg p-2.5 text-xs text-gray-200 transition font-semibold hover:border-blue-500/50 flex flex-col items-center justify-center space-y-1"
                >
                  <div className="flex items-center space-x-1.5">
                    <Copy className="w-3.5 h-3.5 text-blue-400" />
                    <span>Copy for Cline</span>
                  </div>
                  <span className="text-[9px] text-gray-500 font-normal">Task scope constraint</span>
                  {copySuccess === 'cline' && <span className="text-[9px] text-green-400 font-normal mt-0.5">Copied!</span>}
                </button>

                <button
                  onClick={() => handleCopyPrompt('anti')}
                  className="bg-gray-900 hover:bg-gray-850 border border-gray-800 rounded-lg p-2.5 text-xs text-gray-200 transition font-semibold hover:border-indigo-500/50 flex flex-col items-center justify-center space-y-1"
                >
                  <div className="flex items-center space-x-1.5">
                    <Copy className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Copy for Anti</span>
                  </div>
                  <span className="text-[9px] text-gray-500 font-normal">Antigravity task bootstrapper</span>
                  {copySuccess === 'anti' && <span className="text-[9px] text-green-400 font-normal mt-0.5">Copied!</span>}
                </button>
              </div>

              <button
                onClick={() => handleCopyPrompt('minimal')}
                className="w-full bg-gray-950 border border-gray-850 hover:bg-gray-900 text-[10px] text-gray-400 py-2 rounded-lg font-mono transition flex items-center justify-center space-x-1.5"
              >
                <span>📋 Copy minimal file path context</span>
                {copySuccess === 'minimal' && <span className="text-green-400">(Copied!)</span>}
              </button>

            </div>
          ) : (
            <div className="glass-panel rounded-xl p-5 shadow-lg flex-1 flex flex-col items-center justify-center text-center text-gray-600">
              <div className="text-4xl mb-2">⚡</div>
              <p className="text-xs font-semibold text-gray-400">Preflight Prompt View</p>
              <p className="text-[10px] text-gray-500 max-w-[240px] mt-1">
                Configure your repository and query on the left, then click 'Bootstrap' to generate your copy-pasteable context injection prompt.
              </p>
            </div>
          )}
        </section>

        {/* COLUMN 3: Visual Graph Explanation & Reasoning Lists (width: 4/12) */}
        <section className="xl:col-span-4 flex flex-col space-y-5">
          
          {/* Subgraph Explanation Layer */}
          <div className="glass-panel rounded-xl shadow-lg flex-1 flex flex-col overflow-hidden min-h-[300px]">
            <div className="border-b border-gray-800/60 bg-[#0d0f12]/60 px-5 py-3 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-purple-400" />
                <span>Selected Subgraph Connections</span>
              </h2>
              <span className="text-[9px] bg-purple-950/40 text-purple-300 border border-purple-900 px-2 py-0.5 rounded">
                Active Cluster
              </span>
            </div>

            <div className="flex-1 relative bg-gray-950/20">
              {queryResult?.graph ? (
                <TaskScopedGraph graphData={queryResult.graph} />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 p-8 text-center">
                  <p className="text-[10px] text-gray-500">
                    Selected nodes and dependency relations will be plotted once preflight matches complete.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Reasoning & Why Selected lists */}
          {queryResult && queryResult.selectedFiles && (
            <div className="glass-panel rounded-xl p-5 shadow-lg">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-2 mb-3">
                <ArrowRight className="w-4 h-4 text-green-400" />
                <span>"Why Selected" Reasoning Layer</span>
              </h2>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {queryResult.selectedFiles.map((file, idx) => (
                  <div 
                    key={idx}
                    className="bg-gray-950/60 border border-gray-900/60 rounded-lg p-2.5 flex gap-2.5 hover:border-gray-800 transition"
                  >
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-950/60 border border-indigo-900/80 text-indigo-400 flex items-center justify-center font-mono text-[10px] font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-semibold text-white truncate flex items-center gap-1.5">
                        <span>{file.name}</span>
                        <span className="text-[8px] font-mono text-gray-600 truncate">
                          {file.path}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed font-mono text-left">
                        {file.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

      </div>

      {/* Side-by-Side Comparison Demo Mode Section (Value Proposition) */}
      <section className="border-t border-gray-800/60 bg-gray-950/40 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 text-center">
            The Value Proposition: Why Use Pre-Context Injection?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Without CodeGalaxy Card */}
            <div className="bg-red-950/10 border border-red-900/20 rounded-xl p-5 relative overflow-hidden">
              <div className="absolute top-3 right-3 text-red-500">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
                ❌ Without CodeGalaxy (Standard Coding Agents)
              </h3>
              <ul className="text-xs text-gray-400 space-y-2 list-disc list-inside">
                <li>AI scans full directories blindly, reading thousands of lines of unneeded boilerplate.</li>
                <li>Fast context windows fill up, resulting in extreme token billing spikes.</li>
                <li>AI gets distracted by build caching, test logs, and outdated files.</li>
                <li>Increased AI hallucination—starts rewriting correct code.</li>
              </ul>
            </div>

            {/* With CodeGalaxy Card */}
            <div className="bg-green-950/10 border border-green-900/20 rounded-xl p-5 relative overflow-hidden">
              <div className="absolute top-3 right-3 text-green-500">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">
                ✅ With CodeGalaxy (Pre-Context Task Bootstrapped)
              </h3>
              <ul className="text-xs text-gray-400 space-y-2 list-disc list-inside">
                <li>Deterministic matching filters 99% codebase noise in 1.8 seconds.</li>
                <li>AI restricted to a laser-focused context subset of 5-7 selected files.</li>
                <li>Minimizes context windows, reducing billing costs by up to 90%.</li>
                <li>Eliminates hallucination—AI writes robust code correctly on the first attempt.</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Visual bottom clean footer */}
      <footer className="border-t border-gray-800/40 py-4 px-6 text-center text-[10px] text-gray-600 bg-[#07090b]">
        CodeGalaxy — AI Context Copilot built with love. All rights reserved.
      </footer>
    </main>
  );
}
