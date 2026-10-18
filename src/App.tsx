import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { CodeInputPane } from './components/CodeInputPane.tsx';
import { DiffViewer } from './components/DiffViewer.tsx';
import { RichTerminal } from './components/RichTerminal.tsx';
import { PipelineVisualizer } from './components/PipelineVisualizer.tsx';
import { BugReportView } from './components/BugReportView.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { TriageModal } from './components/TriageModal.tsx';
import { SAMPLE_FILES } from './data/sampleFiles.ts';
import { SampleFile, ReviewResponse, ViewTab } from './types/index.ts';
import { AlertCircle, CheckCircle2, ShieldCheck, Terminal, Cpu, FileCheck } from 'lucide-react';

export default function App() {
  const initialSample = SAMPLE_FILES[0]; // process_data.py from DecodeLabs slides

  const [code, setCode] = useState<string>(initialSample.code);
  const [language, setLanguage] = useState<string>(initialSample.language);
  const [filename, setFilename] = useState<string>(initialSample.filename);
  const [selectedSampleId, setSelectedSampleId] = useState<string>(initialSample.id);

  const [activeTab, setActiveTab] = useState<ViewTab>('ide');
  const [persona, setPersona] = useState<'analytical_gatekeeper' | 'security_auditor' | 'performance_specialist'>('analytical_gatekeeper');
  const [strictValidation, setStrictValidation] = useState<boolean>(true);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [response, setResponse] = useState<ReviewResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [triageError, setTriageError] = useState<'FileNotFoundError' | 'PermissionError' | 'UnicodeDecodeError' | null>(null);

  // Handle Preset selection
  const handleSelectSample = (sample: SampleFile) => {
    setSelectedSampleId(sample.id);
    setCode(sample.code);
    setLanguage(sample.language);
    setFilename(sample.filename);
  };

  // Run IPO Code Audit Pipeline
  const runAudit = async () => {
    setIsRunning(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          filename,
          persona,
          strictValidation,
        }),
      });

      const data: ReviewResponse = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to complete code review pipeline');
        setResponse(data);
      } else {
        setResponse(data);
        setErrorMessage(null);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error connecting to API pipeline');
    } finally {
      setIsRunning(false);
    }
  };

  // Auto-run audit on initial mount so user immediately sees populated IDE diff & rich terminal
  useEffect(() => {
    runAudit();
  }, []);

  const handleApplyRefactoredToInput = () => {
    if (response?.parsed?.refactoredCode) {
      setCode(response.parsed.refactoredCode);
    }
  };

  const handleSimulateTriageError = (type: 'FileNotFoundError' | 'PermissionError' | 'UnicodeDecodeError') => {
    setTriageError(type);
  };

  const bugsList = response?.parsed?.bugs || [];
  const refactoredCode = response?.parsed?.refactoredCode || code;
  const bugReportRaw = response?.parsed?.bugReportRaw || '';
  const explanation = response?.parsed?.explanation || '';
  const elapsedMs = response?.telemetry?.elapsedMs;

  return (
    <div className="min-h-screen bg-[#0a0d12] text-neutral-200 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-white">
      {/* Universal Top Bar */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isRunning={isRunning}
        onRunAudit={runAudit}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasResult={Boolean(response?.success)}
      />

      {/* Context Kicker & Telemetry Strip */}
      <div className="bg-neutral-950 border-b border-neutral-800/80 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-neutral-400">
            <span className="font-semibold text-neutral-300">DecodeLabs Training Kit</span>
            <span aria-hidden="true" className="text-neutral-700">·</span>
            <span>Project 4: Intelligent Code Reviewer &amp; Explainer</span>
            <span aria-hidden="true" className="text-neutral-700">·</span>
            <span className="text-emerald-400 font-mono">gemini-3.8-flash</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-neutral-400">
            {elapsedMs && (
              <span className="tabular-nums">
                Pipeline Latency: <strong className="text-neutral-200">{elapsedMs}ms</strong>
              </span>
            )}
            <span aria-hidden="true" className="text-neutral-700">·</span>
            <span>
              Bugs Flagged: <strong className="text-neutral-200 tabular-nums">{bugsList.length}</strong>
            </span>
            <span aria-hidden="true" className="text-neutral-700">·</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {strictValidation ? 'Strict Gatekeeper Active' : 'Relaxed Mode'}
            </span>
          </div>
        </div>
      </div>

      {/* Error / Rejection Banner if any */}
      {errorMessage && (
        <div className="bg-rose-950/40 border-b border-rose-900/50 px-4 sm:px-6 py-2.5 text-xs text-rose-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            {response?.validation?.rejected && (
              <span className="px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 font-mono text-[11px]">
                Slide 12 Rejection Triggered
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Workspace Split Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[calc(100vh-140px)]">
        {/* Left Column: Code Ingestion & Presets (5 cols) */}
        <section className="lg:col-span-5 flex flex-col h-[700px] lg:h-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>1. Untrusted Source Payload</span>
            </div>
            <span className="text-[11px] text-neutral-400 font-mono">
              Phase 1: Input Capture
            </span>
          </div>
          <div className="flex-1 min-h-0">
            <CodeInputPane
              code={code}
              setCode={setCode}
              language={language}
              setLanguage={setLanguage}
              filename={filename}
              setFilename={setFilename}
              selectedSampleId={selectedSampleId}
              onSelectSample={handleSelectSample}
              onSimulateTriageError={handleSimulateTriageError}
            />
          </div>
        </section>

        {/* Right Column: Output Engine (7 cols) */}
        <section className="lg:col-span-7 flex flex-col h-[700px] lg:h-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>2. Orchestration &amp; Output Verification</span>
            </div>
            {/* View switcher tabs for mobile / small screens */}
            <div className="flex md:hidden items-center gap-1 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800 text-xs">
              <button
                onClick={() => setActiveTab('ide')}
                className={`px-2 py-0.5 rounded ${activeTab === 'ide' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
              >
                IDE
              </button>
              <button
                onClick={() => setActiveTab('terminal')}
                className={`px-2 py-0.5 rounded ${activeTab === 'terminal' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
              >
                Term
              </button>
              <button
                onClick={() => setActiveTab('bugs')}
                className={`px-2 py-0.5 rounded ${activeTab === 'bugs' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
              >
                Bugs
              </button>
              <button
                onClick={() => setActiveTab('pipeline')}
                className={`px-2 py-0.5 rounded ${activeTab === 'pipeline' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
              >
                IPO
              </button>
            </div>
            <span className="hidden md:inline text-[11px] text-neutral-400 font-mono">
              Phases 2, 3 &amp; 4
            </span>
          </div>

          <div className="flex-1 min-h-0">
            {activeTab === 'ide' && (
              <DiffViewer
                originalCode={code}
                refactoredCode={refactoredCode}
                language={language}
                filename={filename}
                onApplyRefactoredToInput={handleApplyRefactoredToInput}
              />
            )}

            {activeTab === 'terminal' && (
              <RichTerminal
                filename={filename}
                language={language}
                bugReportMarkdown={bugReportRaw}
                refactoredCode={refactoredCode}
                explanationMarkdown={explanation}
                elapsedMs={elapsedMs}
                onRunAudit={runAudit}
                isRunning={isRunning}
              />
            )}

            {activeTab === 'bugs' && (
              <BugReportView
                bugs={bugsList}
                rawMarkdown={bugReportRaw}
                explanation={explanation}
                filename={filename}
                hasAudited={Boolean(response)}
              />
            )}

            {activeTab === 'pipeline' && (
              <PipelineVisualizer
                response={response}
                isRunning={isRunning}
                code={code}
                filename={filename}
                persona={persona}
              />
            )}
          </div>
        </section>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        persona={persona}
        setPersona={setPersona}
        strictValidation={strictValidation}
        setStrictValidation={setStrictValidation}
      />

      {/* Triage Simulation Modal (Slide 8) */}
      <TriageModal
        isOpen={Boolean(triageError)}
        onClose={() => setTriageError(null)}
        errorType={triageError}
      />
    </div>
  );
}
