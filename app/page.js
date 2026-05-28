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
  Info
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
  const [copySuccess, setCopySuccess] = useState(false);

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

  // Copy structured prompt code to clipboard
  const handleCopyPrompt = () => {
    if (!queryResult || !queryResult.selectedFiles) return;

    const filesListStr = queryResult.selectedFiles
      .map((f, idx) => `  ${idx + 1}. [${f.name}](file://${f.path}) - ${f.reason}`)
      .join('\n');

    const promptText = `You are working on the task: "${queryText}".
To minimize token costs and avoid hallucination, ONLY read and edit these recommended files:
${filesListStr}

Do not read other unselected files unless absolutely necessary.`;

    navigator.clipboard.writeText(promptText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#090b0d] text-gray-100 flex flex-col selection:bg-blue-600/30 selection:text-blue-300">
      
      {/* Top clean header bar */}
      <header className="border-b border-gray-800/60 bg-[#0d0f12]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600/20 text-blue-500 border border-blue-500/30">
            <Zap className="w-5 h-5 absolute animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              CodeGalaxy
            </h1>
            <p className="text-[10px] text-gray-500 font-mono">MVP Context Engine v1.0</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs bg-gray-900 border border-gray-800 rounded-full px-3 py-1 text-gray-400">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
          <span>Local Engine Active</span>
        </div>
      </header>

      {/* Main Single Page Dual Dashboard Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 p-6 max-w-7xl mx-auto w-full">
        
        {/* LEFT COLUMN: Controls & Context outputs (width: 5/12) */}
        <section className="lg:col-span-5 flex flex-col space-y-5">
          
          {/* Module 1: Repo Scan Control Box */}
          <div className="glass-panel rounded-xl p-5 shadow-lg relative overflow-hidden">
            <h2 className="text-sm font-semibold text-gray-300 flex items-center space-x-2 mb-3">
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
                    <span>{scanResult.fileCount} matching files indexed.</span>
                  </div>
                  <span className="text-[10px] bg-blue-900/40 text-blue-200 border border-blue-800 px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Module 2: Search Context query box */}
          <div className="glass-panel rounded-xl p-5 shadow-lg flex-1 flex flex-col space-y-4">
            <h2 className="text-sm font-semibold text-gray-300 flex items-center space-x-2">
              <Search className="w-4 h-4 text-indigo-400" />
              <span>Search Task Query</span>
            </h2>

            <div className="space-y-3">
              <input
                type="text"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Ask what file handles what task..."
                className="w-full text-xs bg-gray-950 border border-gray-800 rounded-lg px-3 py-2.5 text-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />

              {/* Toggle optional Gemini Reranking (Disabled by default) */}
              <div className="flex items-center justify-between bg-gray-900/50 border border-gray-800/80 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Cpu className="w-4 h-4 text-indigo-400 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-gray-300">Improve with AI Rerank</div>
                    <div className="text-[10px] text-gray-500">Gemini Flash-Lite semantic metadata filter.</div>
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
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isQuerying ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{isQuerying ? 'Searching & Mapping Graph...' : 'Search Context'}</span>
              </button>
            </div>

            {/* Error logs box if any failure */}
            {errorMessage && (
              <div className="bg-red-950/20 border border-red-900/50 text-red-400 rounded-lg p-3 text-xs font-mono">
                {errorMessage}
              </div>
            )}

            {/* Dynamic Results outputs */}
            {queryResult && (
              <div className="flex-1 flex flex-col space-y-4 pt-2">
                
                {/* Reduction metrics block */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-900/60 border border-gray-800 p-3 rounded-lg text-center">
                    <div className="text-[10px] text-gray-500 font-mono uppercase">Pruned Files Not Selected</div>
                    <div className="text-lg font-bold text-green-400 mt-0.5">
                      {queryResult.prunedCount} / {queryResult.totalFiles}
                    </div>
                    <div className="text-[10px] text-gray-400">({queryResult.reductionPercent}% Pruning Ratio)</div>
                  </div>
                  <div className="bg-gray-900/60 border border-gray-800 p-3 rounded-lg text-center flex flex-col justify-center">
                    <div className="text-[10px] text-gray-500 font-mono uppercase">Context Target Size</div>
                    <div className="text-lg font-bold text-blue-400 mt-0.5">
                      {queryResult.selectedFiles.length} files
                    </div>
                    <span className="text-[10px] text-blue-200 bg-blue-900/20 px-2 py-0.5 rounded border border-blue-900 self-center mt-1">
                      Optimal size
                    </span>
                  </div>
                </div>

                {/* Collapsible preview of what is sent to AI (Privacy transparency) */}
                {improveWithAi && (
                  <details className="group border border-gray-800/80 bg-gray-900/30 rounded-lg text-xs overflow-hidden">
                    <summary className="flex items-center justify-between p-3 font-semibold text-gray-400 cursor-pointer hover:bg-gray-800/30 transition select-none">
                      <div className="flex items-center space-x-1.5">
                        <Info className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Show preview of data sent to AI</span>
                      </div>
                      <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="p-3 border-t border-gray-800/60 bg-gray-950/60 text-gray-500 max-h-[140px] overflow-y-auto font-mono text-[10px] space-y-1">
                      <p className="text-indigo-300 font-semibold mb-1">Lightweight non-code metadata transmitted:</p>
                      {queryResult.candidatesForAi?.map((c, idx) => (
                        <div key={idx} className="truncate">
                          {idx + 1}. {c.path} ({c.name})
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {/* COPY PROMPT CALL TO ACTION */}
                <button
                  onClick={handleCopyPrompt}
                  className="bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg p-3 text-xs flex items-center justify-between text-gray-300 transition group focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <div className="flex items-center space-x-2">
                    <Copy className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition" />
                    <div>
                      <div className="font-semibold text-left">Copy Prompt Context</div>
                      <div className="text-[10px] text-gray-500">Inject recommended files direct into agent.</div>
                    </div>
                  </div>
                  {copySuccess ? (
                    <span className="text-green-400 text-[10px] bg-green-950/40 border border-green-900 px-2 py-0.5 rounded flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Copied!</span>
                    </span>
                  ) : (
                    <span className="text-gray-500 text-xs">📋</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT COLUMN: Interactive Task Graph & File Lists (width: 7/12) */}
        <section className="lg:col-span-7 flex flex-col space-y-5">
          
          {/* Module 3: Canvas visualizer subgraph box */}
          <div className="glass-panel rounded-xl shadow-lg flex-1 flex flex-col overflow-hidden min-h-[400px]">
            <div className="border-b border-gray-800/60 bg-[#0d0f12]/60 px-5 py-3.5 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-300 flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-purple-400" />
                <span>Task-Scoped Subgraph Visualization</span>
              </h2>
              <span className="text-[10px] bg-purple-950/40 text-purple-300 border border-purple-900 px-2.5 py-0.5 rounded-full font-semibold">
                Interactive Graph
              </span>
            </div>

            <div className="flex-1 relative bg-gray-950/20">
              {queryResult?.graph ? (
                <TaskScopedGraph graphData={queryResult.graph} />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 p-8 text-center">
                  <div className="text-4xl mb-2">🌌</div>
                  <p className="text-xs font-semibold text-gray-400">Codebase Graph View ready</p>
                  <p className="text-[10px] text-gray-500 max-w-xs mt-1">
                    Once you run a query search, the localized components and their file connections will render here.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Module 4: Order recommended files lists */}
          {queryResult && queryResult.selectedFiles && (
            <div className="glass-panel rounded-xl p-5 shadow-lg">
              <h2 className="text-sm font-semibold text-gray-300 flex items-center space-x-2 mb-3">
                <ArrowRight className="w-4 h-4 text-green-400" />
                <span>Recommended Context Read Order</span>
              </h2>

              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {queryResult.selectedFiles.map((file, idx) => (
                  <div 
                    key={idx}
                    className="bg-gray-900/60 border border-gray-800/80 rounded-lg p-3 flex gap-3 hover:border-gray-700/80 transition"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-950/60 border border-blue-900/80 text-blue-400 flex items-center justify-center font-mono text-xs font-semibold">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate flex items-center gap-2">
                        <span>{file.name}</span>
                        <span className="text-[9px] font-mono text-gray-500 select-all font-normal">
                          {file.path}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
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

      {/* Visual bottom clean footer */}
      <footer className="border-t border-gray-800/40 py-4 px-6 text-center text-[10px] text-gray-600 bg-[#07090b]">
        CodeGalaxy — Context Engine MVP built with love. All rights reserved.
      </footer>
    </main>
  );
}
