import React, { useState, useRef, useEffect } from 'react';
import { Terminal, CornerDownLeft, Copy, Check, Play, Trash2 } from 'lucide-react';
import { highlightCode } from '../utils/codeHighlighter.ts';

interface RichTerminalProps {
  filename: string;
  language: string;
  bugReportMarkdown: string;
  refactoredCode: string;
  explanationMarkdown: string;
  elapsedMs?: number;
  onRunAudit: () => void;
  isRunning: boolean;
}

export const RichTerminal: React.FC<RichTerminalProps> = ({
  filename,
  language,
  bugReportMarkdown,
  refactoredCode,
  explanationMarkdown,
  elapsedMs,
  onRunAudit,
  isRunning,
}) => {
  const [commandInput, setCommandInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [customLogs, setCustomLogs] = useState<string[]>([]);
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  const highlightedRefactored = highlightCode(refactoredCode, language);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim();
    if (!cmd) return;

    if (cmd === 'clear') {
      setCustomLogs([]);
      setCommandInput('');
      return;
    }

    if (cmd === 'audit' || cmd === 'run') {
      onRunAudit();
      setCustomLogs((prev) => [...prev, `$ ${cmd}`, 'Initiating IPO Gatekeeper pipeline...']);
      setCommandInput('');
      return;
    }

    if (cmd === 'help') {
      setCustomLogs((prev) => [
        ...prev,
        `$ ${cmd}`,
        'Available commands:',
        '  audit        Execute full IPO gatekeeper pipeline',
        '  status       Display current session telemetry',
        '  cat          Dump refactored source buffer',
        '  clear        Clear custom terminal logs',
        '  help         Print this command summary'
      ]);
      setCommandInput('');
      return;
    }

    if (cmd === 'status') {
      setCustomLogs((prev) => [
        ...prev,
        `$ ${cmd}`,
        `[TELEMETRY] Target: ${filename} | Lang: ${language} | Last Latency: ${elapsedMs || 0}ms`,
        `[STATUS] Gatekeeper verification: PASSED`,
      ]);
      setCommandInput('');
      return;
    }

    if (cmd === 'cat') {
      setCustomLogs((prev) => [
        ...prev,
        `$ ${cmd} ${filename}`,
        refactoredCode || '// Buffer empty. Run audit first.',
      ]);
      setCommandInput('');
      return;
    }

    setCustomLogs((prev) => [
      ...prev,
      `$ ${cmd}`,
      `bash: command not found: ${cmd}. Type 'help' for command list.`,
    ]);
    setCommandInput('');
  };

  const handleCopyTerminal = () => {
    const fullText = `## BUG_REPORT\n${bugReportMarkdown}\n\n## REFACTORED_CODE\n\`\`\`${language}\n${refactoredCode}\n\`\`\`\n\n## EXPLANATION\n${explanationMarkdown}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [bugReportMarkdown, refactoredCode, customLogs]);

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border border-neutral-800 rounded-xl overflow-hidden shadow-2xl terminal-window">
      {/* Terminal Title Bar (Slide 13 & 14) */}
      <div className="px-4 py-2.5 bg-[#161b22] border-b border-neutral-800 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          {/* Window control buttons */}
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block border border-rose-600/50" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block border border-amber-600/50" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block border border-emerald-600/50" />
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>user@system:~</span>
            <span className="text-neutral-500">/</span>
            <span className="text-neutral-400">decodelabs-gatekeeper</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCustomLogs([])}
            title="Clear logs"
            className="p-1 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopyTerminal}
            className="px-2 py-0.5 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded transition-colors flex items-center gap-1"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Terminal Content Screen */}
      <div className="flex-1 p-4 overflow-auto font-mono text-xs leading-6 text-neutral-300 space-y-4">
        {/* Startup banner */}
        <div className="text-neutral-500 pb-2 border-b border-neutral-800/80">
          <div>DecodeLabs Architectural Gatekeeper [Batch 2026 - Project 4]</div>
          <div>Rich Terminal Rendering Engine v4.2 · IPO Pipeline Active</div>
        </div>

        {/* Executed command line */}
        <div className="flex items-center gap-2 text-emerald-400">
          <span className="text-neutral-500">user@system:~$</span>
          <span className="text-white font-medium">
            python -m decodelabs.gatekeeper audit --file {filename} --strict-validation
          </span>
          {elapsedMs && (
            <span className="text-neutral-500 text-[11px] ml-auto tabular-nums">
              [{elapsedMs}ms]
            </span>
          )}
        </div>

        {/* Section 1: BUG_REPORT */}
        <div className="space-y-1">
          <div className="text-rose-400 font-bold flex items-center gap-2 text-sm">
            <span>## BUG_REPORT</span>
          </div>
          {bugReportMarkdown ? (
            <div className="pl-3 border-l-2 border-rose-500/40 text-neutral-200 space-y-1 py-1">
              {bugReportMarkdown.split('\n').map((line, i) => {
                if (!line.trim()) return null;
                const isBullet = line.startsWith('-') || line.startsWith('*');
                return (
                  <div key={i} className="flex items-start gap-2">
                    {isBullet && <span className="text-rose-400 font-bold shrink-0">•</span>}
                    <span
                      className={line.includes('**') ? 'text-white' : 'text-neutral-300'}
                      dangerouslySetInnerHTML={{
                        __html: line
                          .replace(/^[-*]\s*/, '')
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-rose-300 font-semibold">$1</strong>')
                          .replace(/`(.*?)`/g, '<code class="bg-neutral-800 px-1 py-0.5 rounded text-amber-300">$1</code>'),
                      }}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-neutral-500 pl-3 italic">
              No audit results yet. Click 'Execute Audit' or type 'audit' below.
            </div>
          )}
        </div>

        {/* Section 2: REFACTORED_CODE */}
        <div className="space-y-2 pt-2">
          <div className="text-emerald-400 font-bold flex items-center justify-between text-sm">
            <span>## REFACTORED_CODE</span>
            <span className="text-[11px] text-neutral-400 font-normal">
              Language: {language} · Syntax-Highlighted
            </span>
          </div>

          <div className="rounded-lg bg-[#161b22] border border-neutral-800 overflow-hidden">
            <div className="px-3 py-1 bg-neutral-900 border-b border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between font-mono">
              <span>{filename} (corrected)</span>
              <span className="text-emerald-400">Strict Compiler Ready</span>
            </div>
            <div className="p-3 overflow-x-auto">
              <pre className="m-0">
                <code
                  className="hljs bg-transparent p-0 block leading-5 text-neutral-200 font-mono"
                  dangerouslySetInnerHTML={{ __html: highlightedRefactored || '// Refactored code will appear here...' }}
                />
              </pre>
            </div>
          </div>
        </div>

        {/* Section 3: EXPLANATION */}
        {explanationMarkdown && (
          <div className="space-y-1 pt-2">
            <div className="text-sky-400 font-bold text-sm">## EXPLANATION</div>
            <div className="pl-3 border-l-2 border-sky-500/40 text-neutral-300 space-y-1.5 py-1">
              {explanationMarkdown.split('\n').map((line, i) => {
                if (!line.trim()) return null;
                return (
                  <div
                    key={i}
                    dangerouslySetInnerHTML={{
                      __html: line
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-sky-200 font-semibold">$1</strong>')
                        .replace(/`(.*?)`/g, '<code class="bg-neutral-800 px-1 rounded text-neutral-200">$1</code>'),
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Custom CLI command logs */}
        {customLogs.length > 0 && (
          <div className="pt-2 border-t border-neutral-800 text-neutral-300 space-y-1">
            {customLogs.map((log, i) => (
              <div
                key={i}
                className={log.startsWith('$') ? 'text-emerald-400 font-semibold' : 'text-neutral-400'}
              >
                {log}
              </div>
            ))}
          </div>
        )}

        <div ref={terminalBottomRef} />
      </div>

      {/* Interactive Command Prompt */}
      <form
        onSubmit={handleCommandSubmit}
        className="px-4 py-2 bg-[#161b22] border-t border-neutral-800 flex items-center gap-2"
      >
        <span className="text-neutral-500 font-mono text-xs">user@system:~$</span>
        <input
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          placeholder="type 'audit', 'help', 'status', 'cat', or 'clear'..."
          className="flex-1 bg-transparent border-0 text-white font-mono text-xs focus:outline-none placeholder:text-neutral-600"
          disabled={isRunning}
        />
        <button
          type="submit"
          disabled={isRunning || !commandInput.trim()}
          className="text-neutral-400 hover:text-emerald-400 transition-colors p-1"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
