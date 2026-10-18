import React, { useState } from 'react';
import { Database, Cpu, CheckSquare, TerminalSquare, ArrowRight, ShieldCheck, CheckCircle2, XCircle, Info } from 'lucide-react';
import { ReviewResponse } from '../types/index.ts';

interface PipelineVisualizerProps {
  response: ReviewResponse | null;
  isRunning: boolean;
  code: string;
  filename: string;
  persona: string;
}

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({
  response,
  isRunning,
  code,
  filename,
  persona,
}) => {
  const [selectedPhase, setSelectedPhase] = useState<number>(1);

  const hasResult = Boolean(response?.success);
  const isValidationPassed = Boolean(response?.validation?.passed);
  const isValidationRejected = Boolean(response?.validation?.rejected);

  const phases = [
    {
      id: 1,
      title: '1. Local System',
      subtitle: 'Safe File Stream & Triage',
      icon: Database,
      status: code ? 'completed' : 'pending',
      summary: 'open().read() safely streams raw payload buffer while preserving whitespaces and lexical rules.',
      details: {
        filename,
        bufferSize: `${new Blob([code]).size} bytes`,
        lineCount: code.split('\n').length,
        triageStatus: 'UTF-8 verified · UnicodeDecodeError safe',
        concept: 'Source code is bound by formal grammars and strict lexical rules (Slide 7).',
      },
    },
    {
      id: 2,
      title: '2. API Client',
      subtitle: 'Context & Persona Injection',
      icon: Cpu,
      status: isRunning ? 'active' : hasResult ? 'completed' : 'pending',
      summary: 'Raw code payload merges with cold analytical Senior QA constraints into Gemini 3.8 Flash.',
      details: {
        model: 'gemini-3.8-flash',
        personaSelected: persona,
        modality: 'Analytical Gatekeeper (locked behavior, zero conversational filler)',
        systemInstruction:
          'You are a cold, analytical Senior Code Quality Assurance Engineer. You only output valid code blocks and direct bullet points.',
        reasoningEngine: 'Constructs abstract model of execution flow (Slide 9).',
      },
    },
    {
      id: 3,
      title: '3. Validation',
      subtitle: 'Structured Output Gate',
      icon: CheckSquare,
      status: isRunning ? 'active' : isValidationRejected ? 'error' : isValidationPassed ? 'completed' : 'pending',
      summary: 'Enforces exact presence of ## BUG_REPORT and ## REFACTORED_CODE headers. Rejects malformed reports.',
      details: {
        hasBugReportHeader: response?.validation?.hasBugReportHeader ?? false,
        hasRefactoredCodeHeader: response?.validation?.hasRefactoredCodeHeader ?? false,
        ruleEnforced: 'Slide 12: If model fails to return both explicit headers, script rejects response.',
        statusVerdict: isValidationPassed ? 'Strict Schema Verified' : isValidationRejected ? 'Rejected by Gatekeeper' : 'Awaiting Audit',
      },
    },
    {
      id: 4,
      title: '4. Rendering Engine',
      subtitle: 'Rich Terminal & IDE Diff',
      icon: TerminalSquare,
      status: hasResult ? 'completed' : 'pending',
      summary: 'Compiles raw markdown to dynamic color-mapped syntax highlighting and split visual diff.',
      details: {
        syntaxHighlighter: 'Color-mapped language tags (Slide 14)',
        diffEngine: 'Line-by-line unified & split diff generator',
        latency: response?.telemetry?.elapsedMs ? `${response.telemetry.elapsedMs}ms` : 'N/A',
        bugsIdentified: response?.parsed?.bugs?.length ?? 0,
      },
    },
  ];

  return (
    <div className="flex flex-col h-full bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
      {/* Blueprint Header (Slide 4 & 6) */}
      <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">
            The IPO Architecture Blueprint
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Slide 6 &amp; 15: From raw file ingestion to strict output validation and rich terminal rendering.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
          <span>Active Pipeline:</span>
          <span className="text-emerald-400 font-semibold">IPO-v4.2026</span>
        </div>
      </div>

      {/* 4 Pipeline Stages Progression Cards */}
      <div className="p-4 bg-neutral-950/60 border-b border-neutral-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {phases.map((phase, idx) => {
            const Icon = phase.icon;
            const isSelected = selectedPhase === phase.id;

            let badgeColor = 'bg-neutral-800 text-neutral-400';
            if (phase.status === 'completed') badgeColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
            if (phase.status === 'active') badgeColor = 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse';
            if (phase.status === 'error') badgeColor = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';

            return (
              <button
                key={phase.id}
                onClick={() => setSelectedPhase(phase.id)}
                className={`p-3 rounded-lg text-left transition-all border ${
                  isSelected
                    ? 'border-emerald-500/50 bg-neutral-800/80 shadow-md'
                    : 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-200">
                    <Icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${badgeColor}`}>
                    {phase.status}
                  </span>
                </div>
                <div className="text-xs font-semibold text-white">{phase.title}</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">{phase.subtitle}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Phase Inspector */}
      <div className="flex-1 p-5 overflow-auto bg-neutral-950 font-mono text-xs">
        {selectedPhase === 1 && (
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Phase 1: Input &amp; Payload Capture (Slide 7 &amp; 8)</span>
            </div>
            <p className="text-neutral-300 font-sans text-xs leading-relaxed">
              The system locates the targeted codebase files and streams their contents directly into application memory
              as an untrusted string payload. All whitespace, carriage returns, and indentation formatting are preserved.
            </p>

            <div className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-800 space-y-2">
              <div className="text-neutral-400 text-[11px] uppercase tracking-wider font-sans font-semibold">
                Capture Stream Inspector
              </div>
              <div className="grid grid-cols-2 gap-2 text-neutral-200">
                <div>Source Target: <span className="text-emerald-400">{filename}</span></div>
                <div>Payload Buffer: <span className="text-neutral-300">{new Blob([code]).size} Bytes</span></div>
                <div>Line Count: <span className="text-neutral-300">{code.split('\n').length} lines</span></div>
                <div>Whitespace Preservation: <span className="text-emerald-400">Strict CRLF Active</span></div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-800 space-y-2">
              <div className="text-neutral-400 text-[11px] uppercase tracking-wider font-sans font-semibold">
                Input Ingestion Triage Matrix (Slide 8)
              </div>
              <div className="space-y-1.5 text-neutral-300 font-sans text-xs">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>FileNotFoundError:</strong> Catches invalid file paths and triggers clean exit with explanation.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>PermissionError:</strong> Safely rejects restricted read operations.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>UnicodeDecodeError:</strong> Sanitizes binary control characters and validates UTF-8 streams.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedPhase === 2 && (
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Phase 2: Context Orchestration &amp; LLM Taming Matrix (Slide 10 &amp; 11)</span>
            </div>
            <p className="text-neutral-300 font-sans text-xs leading-relaxed">
              Unlike conversational AI which introduces non-deterministic variations and conversational filler,
              the Analytical Gatekeeper enforces locked behavior using strict system instructions hardcoded during client initialization.
            </p>

            <div className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-800 space-y-2">
              <div className="text-neutral-400 text-[11px] uppercase tracking-wider font-sans font-semibold">
                Hardcoded System Instruction (Slide 11)
              </div>
              <pre className="p-3 bg-neutral-950 rounded border border-neutral-800 text-amber-300 text-xs overflow-x-auto whitespace-pre-wrap font-mono">
{`SYSTEM_INSTRUCTION = """
You are a cold, analytical Senior Code Quality Assurance Engineer.

You only output valid code blocks and direct bullet points.

Do not write friendly greetings.
"""`}
              </pre>
            </div>

            <div className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-800 space-y-2">
              <div className="text-neutral-400 text-[11px] uppercase tracking-wider font-sans font-semibold">
                Semantic AST Parsing Advantage (Slide 9)
              </div>
              <p className="text-neutral-300 font-sans text-xs leading-relaxed">
                Unlike regex-based linters, Gemini constructs an abstract execution graph of the program flow,
                enabling detection of runtime edge cases, concurrency deadlocks, and logic gaps before execution.
              </p>
            </div>
          </div>
        )}

        {selectedPhase === 3 && (
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <span>Phase 3: Structured Output Validation Gate (Slide 12)</span>
            </div>
            <p className="text-neutral-300 font-sans text-xs leading-relaxed">
              Slide 12 Warning: "If the model fails to return both explicit section headers, the script rejects
              the response to ensure malformed reports are never pushed to the pipeline."
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className={`p-3.5 rounded-lg border ${
                response?.validation?.hasBugReportHeader ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-neutral-900 border-neutral-800'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white">## BUG_REPORT</span>
                  {response?.validation?.hasBugReportHeader ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="text-neutral-500">pending</span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-400 font-sans">
                  Must contain only direct, concise bullet points detailing syntax anomalies, logical vulnerabilities, and performance bugs.
                </p>
              </div>

              <div className={`p-3.5 rounded-lg border ${
                response?.validation?.hasRefactoredCodeHeader ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-neutral-900 border-neutral-800'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white">## REFACTORED_CODE</span>
                  {response?.validation?.hasRefactoredCodeHeader ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="text-neutral-500">pending</span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-400 font-sans">
                  Must contain only a single, valid Markdown-fenced code block containing corrected, compilable code.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-800">
              <div className="text-neutral-400 text-[11px] uppercase tracking-wider font-sans font-semibold mb-1">
                Gatekeeper Verdict
              </div>
              <div className="text-neutral-200">
                {isValidationPassed && (
                  <span className="text-emerald-400 flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Passed: All explicit section headers present and verified.
                  </span>
                )}
                {isValidationRejected && (
                  <span className="text-rose-400 flex items-center gap-1.5 font-semibold">
                    <XCircle className="w-4 h-4" /> Rejected: Missing required section headers.
                  </span>
                )}
                {!response && (
                  <span className="text-neutral-400 italic">Audit not yet executed. Run audit to evaluate.</span>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedPhase === 4 && (
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <TerminalSquare className="w-4 h-4 text-emerald-400" />
              <span>Phase 4: Rich Terminal &amp; Syntax Rendering Engine (Slide 13, 14 &amp; 15)</span>
            </div>
            <p className="text-neutral-300 font-sans text-xs leading-relaxed">
              Standard terminals print unformatted markdown strings. The DecodeLabs rendering engine applies
              color-mapped syntax highlighting dynamically based on language tags for IDE-grade clarity.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-800">
                <div className="text-neutral-400 text-[11px] font-sans">Pipeline Execution Latency</div>
                <div className="text-lg font-semibold text-white font-mono mt-1 tabular-nums">
                  {response?.telemetry?.elapsedMs ? `${response.telemetry.elapsedMs}ms` : '—'}
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-800">
                <div className="text-neutral-400 text-[11px] font-sans">Bugs Cataloged</div>
                <div className="text-lg font-semibold text-white font-mono mt-1 tabular-nums">
                  {response?.parsed?.bugs?.length ?? 0}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
