import React, { useState, useMemo } from 'react';
import { Copy, Check, Download, ArrowRightLeft, Columns, GitCompare, Code2, CheckCircle2 } from 'lucide-react';
import { highlightCode, generateLineDiff, DiffLine } from '../utils/codeHighlighter.ts';

interface DiffViewerProps {
  originalCode: string;
  refactoredCode: string;
  language: string;
  filename: string;
  onApplyRefactoredToInput: () => void;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  originalCode,
  refactoredCode,
  language,
  filename,
  onApplyRefactoredToInput,
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'unified' | 'refactored'>('split');
  const [copied, setCopied] = useState(false);

  // Compute diff lines
  const diffLines = useMemo(() => {
    return generateLineDiff(originalCode, refactoredCode);
  }, [originalCode, refactoredCode]);

  // Syntax highlighted code blocks
  const originalHighlighted = useMemo(() => {
    return highlightCode(originalCode, language);
  }, [originalCode, language]);

  const refactoredHighlighted = useMemo(() => {
    return highlightCode(refactoredCode, language);
  }, [refactoredCode, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(refactoredCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extIndex = filename.lastIndexOf('.');
    const baseName = extIndex !== -1 ? filename.substring(0, extIndex) : filename;
    const ext = extIndex !== -1 ? filename.substring(extIndex) : `.${language}`;
    const newFilename = `${baseName}_refactored${ext}`;

    const blob = new Blob([refactoredCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = newFilename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const addedLinesCount = diffLines.filter((l) => l.type === 'added').length;
  const removedLinesCount = diffLines.filter((l) => l.type === 'removed').length;

  return (
    <div className="flex flex-col h-full bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
      {/* Top Controls Bar */}
      <div className="p-3 bg-neutral-950 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
        {/* View Mode Segmented Controls */}
        <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              viewMode === 'split' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            Split View
          </button>
          <button
            onClick={() => setViewMode('unified')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              viewMode === 'unified' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            Unified Diff
          </button>
          <button
            onClick={() => setViewMode('refactored')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              viewMode === 'refactored' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Refactored Only
          </button>
        </div>

        {/* Diff Line Statistics */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-emerald-400 font-semibold tabular-nums">+{addedLinesCount} lines</span>
          <span aria-hidden="true" className="text-neutral-600">·</span>
          <span className="text-rose-400 font-semibold tabular-nums">-{removedLinesCount} lines</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onApplyRefactoredToInput}
            title="Replace input code with this refactored version"
            className="px-2.5 py-1 text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Apply to Input
          </button>
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Code'}
          </button>
          <button
            onClick={handleDownload}
            className="px-2.5 py-1 text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      </div>

      {/* Main Diff Content */}
      <div className="flex-1 overflow-auto bg-neutral-950 font-mono text-xs leading-5">
        {/* 1. SPLIT VIEW */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-neutral-800 min-h-full">
            {/* Original Input Pane */}
            <div className="flex flex-col">
              <div className="px-3 py-1.5 bg-neutral-900/60 border-b border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
                <span>Original Code ({filename})</span>
                <span className="text-rose-400 font-mono">Untrusted Raw Stream</span>
              </div>
              <div className="p-3 overflow-auto">
                <pre className="m-0">
                  <code
                    className="hljs bg-transparent p-0 block leading-5"
                    dangerouslySetInnerHTML={{ __html: originalHighlighted }}
                  />
                </pre>
              </div>
            </div>

            {/* Refactored Output Pane */}
            <div className="flex flex-col bg-emerald-950/10">
              <div className="px-3 py-1.5 bg-neutral-900/60 border-b border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
                <span>Refactored &amp; Optimized</span>
                <span className="text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Gatekeeper Approved
                </span>
              </div>
              <div className="p-3 overflow-auto">
                <pre className="m-0">
                  <code
                    className="hljs bg-transparent p-0 block leading-5"
                    dangerouslySetInnerHTML={{ __html: refactoredHighlighted }}
                  />
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* 2. UNIFIED DIFF VIEW */}
        {viewMode === 'unified' && (
          <div className="divide-y divide-neutral-900 select-text">
            {diffLines.map((line, idx) => {
              const isAdded = line.type === 'added';
              const isRemoved = line.type === 'removed';

              let rowBg = 'hover:bg-neutral-900/50';
              let lineIndicator = ' ';
              let indicatorColor = 'text-neutral-600';
              let textColor = 'text-neutral-300';

              if (isAdded) {
                rowBg = 'bg-emerald-950/30 text-emerald-200 hover:bg-emerald-950/50';
                lineIndicator = '+';
                indicatorColor = 'text-emerald-400 font-bold';
                textColor = 'text-emerald-200';
              } else if (isRemoved) {
                rowBg = 'bg-rose-950/30 text-rose-200 hover:bg-rose-950/50';
                lineIndicator = '-';
                indicatorColor = 'text-rose-400 font-bold';
                textColor = 'text-rose-300';
              }

              return (
                <div key={idx} className={`flex items-start px-2 py-0.5 ${rowBg} font-mono text-xs leading-5`}>
                  {/* Old line number */}
                  <span className="w-10 text-right pr-2 text-neutral-600 select-none tabular-nums shrink-0">
                    {line.oldLineNumber || ''}
                  </span>
                  {/* New line number */}
                  <span className="w-10 text-right pr-2 text-neutral-600 select-none tabular-nums shrink-0">
                    {line.newLineNumber || ''}
                  </span>
                  {/* Diff indicator (+/-) */}
                  <span className={`w-5 text-center select-none ${indicatorColor} shrink-0`}>
                    {lineIndicator}
                  </span>
                  {/* Line text */}
                  <span className={`whitespace-pre-wrap break-all flex-1 ${textColor}`}>
                    {line.content || ' '}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. REFACTORED ONLY */}
        {viewMode === 'refactored' && (
          <div className="p-4 overflow-auto">
            <pre className="m-0">
              <code
                className="hljs bg-transparent p-0 block leading-6"
                dangerouslySetInnerHTML={{ __html: refactoredHighlighted }}
              />
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
