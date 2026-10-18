import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, Copy, Check, Filter, BookOpen } from 'lucide-react';
import { BugItem } from '../types/index.ts';

interface BugReportViewProps {
  bugs: BugItem[];
  rawMarkdown: string;
  explanation: string;
  filename: string;
  hasAudited: boolean;
}

export const BugReportView: React.FC<BugReportViewProps> = ({
  bugs,
  rawMarkdown,
  explanation,
  filename,
  hasAudited,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  const filteredBugs = filterType === 'all'
    ? bugs
    : bugs.filter((b) => b.type === filterType);

  const handleCopyReport = () => {
    navigator.clipboard.writeText(`## BUG_REPORT\n${rawMarkdown}\n\n## EXPLANATION\n${explanation}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const criticalCount = bugs.filter((b) => b.severity === 'critical').length;
  const highCount = bugs.filter((b) => b.severity === 'high').length;
  const mediumCount = bugs.filter((b) => b.severity === 'medium').length;

  if (!hasAudited) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-neutral-900 border border-neutral-800 rounded-xl">
        <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-400 mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-white">No Audit Executed Yet</h3>
        <p className="text-xs text-neutral-400 max-w-sm mt-1">
          Click 'Execute Audit' above to run the DecodeLabs IPO code analysis pipeline and generate a structured bug report.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
      {/* Top Summary Bar */}
      <div className="p-3 bg-neutral-950 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-neutral-400">Total Anomalies: <strong className="text-white tabular-nums">{bugs.length}</strong></span>
          <span aria-hidden="true" className="text-neutral-700">·</span>
          {criticalCount > 0 && (
            <span className="text-rose-400 font-semibold tabular-nums">{criticalCount} Critical</span>
          )}
          {highCount > 0 && (
            <span className="text-amber-400 font-semibold tabular-nums">{highCount} High</span>
          )}
          {mediumCount > 0 && (
            <span className="text-sky-400 font-semibold tabular-nums">{mediumCount} Medium</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
            {['all', 'syntax', 'logic', 'performance', 'security', 'concurrency'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-0.5 text-xs font-medium rounded capitalize transition-colors whitespace-nowrap ${
                  filterType === type
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopyReport}
            className="px-2.5 py-1 text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Report'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-4 space-y-5 bg-neutral-950">
        {/* Bug items list */}
        <div className="space-y-2.5">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">
            Direct Bullet Points (## BUG_REPORT)
          </div>

          {filteredBugs.length === 0 ? (
            <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs text-center">
              No anomalies found for category '{filterType}'.
            </div>
          ) : (
            filteredBugs.map((bug) => {
              let badgeColor = 'bg-neutral-800 text-neutral-300';
              let borderAccent = 'border-neutral-800';
              let Icon = Info;

              if (bug.severity === 'critical') {
                badgeColor = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
                borderAccent = 'border-rose-900/40 bg-rose-950/10';
                Icon = AlertCircle;
              } else if (bug.severity === 'high') {
                badgeColor = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
                borderAccent = 'border-amber-900/40 bg-amber-950/10';
                Icon = AlertTriangle;
              } else if (bug.severity === 'medium') {
                badgeColor = 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
                borderAccent = 'border-sky-900/40 bg-sky-950/10';
                Icon = Info;
              }

              return (
                <div
                  key={bug.id}
                  className={`p-3.5 rounded-lg border ${borderAccent} transition-colors`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 flex-1">
                      <Icon className="w-4 h-4 mt-0.5 shrink-0 text-neutral-400" />
                      <div className="text-xs text-neutral-200 leading-relaxed font-sans">
                        <span
                          dangerouslySetInnerHTML={{
                            __html: bug.raw
                              .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                              .replace(/`(.*?)`/g, '<code class="bg-neutral-800 px-1 py-0.5 rounded text-amber-300 font-mono text-[11px]">$1</code>'),
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                      <span className={`px-2 py-0.5 rounded capitalize ${badgeColor}`}>
                        {bug.severity}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 capitalize">
                        {bug.type}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Plain Language Explanation (Slide 3) */}
        {explanation && (
          <div className="pt-3 border-t border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              <span>Plain Language Architecture Breakdown (## EXPLANATION)</span>
            </div>
            <div className="p-4 rounded-lg bg-neutral-900/70 border border-neutral-800 text-xs text-neutral-300 leading-relaxed space-y-2 font-sans">
              {explanation.split('\n\n').map((paragraph, i) => (
                <p
                  key={i}
                  dangerouslySetInnerHTML={{
                    __html: paragraph
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-sky-300 font-semibold">$1</strong>')
                      .replace(/`(.*?)`/g, '<code class="bg-neutral-800 px-1 py-0.5 rounded text-amber-300 font-mono text-[11px]">$1</code>'),
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
