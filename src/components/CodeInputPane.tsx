import React, { useRef } from 'react';
import { Upload, FileCode, AlertTriangle, RefreshCw, FileText, CheckCircle2 } from 'lucide-react';
import { SAMPLE_FILES } from '../data/sampleFiles.ts';
import { SampleFile } from '../types/index.ts';

interface CodeInputPaneProps {
  code: string;
  setCode: (code: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  filename: string;
  setFilename: (fn: string) => void;
  selectedSampleId: string;
  onSelectSample: (sample: SampleFile) => void;
  onSimulateTriageError: (type: 'FileNotFoundError' | 'PermissionError' | 'UnicodeDecodeError') => void;
}

const SUPPORTED_LANGUAGES = [
  { id: 'python', label: 'Python (.py)', ext: '.py' },
  { id: 'typescript', label: 'TypeScript (.ts)', ext: '.ts' },
  { id: 'javascript', label: 'JavaScript (.js)', ext: '.js' },
  { id: 'java', label: 'Java (.java)', ext: '.java' },
  { id: 'go', label: 'Go (.go)', ext: '.go' },
  { id: 'cpp', label: 'C++ (.cpp)', ext: '.cpp' },
  { id: 'sql', label: 'SQL (.sql)', ext: '.sql' },
  { id: 'json', label: 'JSON (.json)', ext: '.json' },
];

export const CodeInputPane: React.FC<CodeInputPaneProps> = ({
  code,
  setCode,
  language,
  setLanguage,
  filename,
  setFilename,
  selectedSampleId,
  onSelectSample,
  onSimulateTriageError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lineCount = code.split('\n').length;
  const byteCount = new Blob([code]).size;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFilename(file.name);
    // Auto-detect language by extension
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const match = SUPPORTED_LANGUAGES.find((l) => l.ext === ext);
    if (match) {
      setLanguage(match.id);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCode(content);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setFilename(file.name);
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const match = SUPPORTED_LANGUAGES.find((l) => l.ext === ext);
    if (match) setLanguage(match.id);

    const reader = new FileReader();
    reader.onload = (event) => {
      setCode((event.target?.result as string) || '');
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
      {/* Top File Ribbon */}
      <div className="p-3 bg-neutral-950 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-emerald-400" />
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1 text-xs font-mono text-neutral-200 focus:outline-none focus:border-emerald-500 w-44"
            placeholder="filename.py"
          />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Benchmarks Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-neutral-400 whitespace-nowrap">Load Preset:</label>
          <select
            value={selectedSampleId}
            onChange={(e) => {
              const sample = SAMPLE_FILES.find((s) => s.id === e.target.value);
              if (sample) onSelectSample(sample);
            }}
            className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-300 focus:outline-none focus:border-emerald-500 max-w-xs truncate"
          >
            {SAMPLE_FILES.map((sample) => (
              <option key={sample.id} value={sample.id}>
                {sample.filename} — {sample.language}
              </option>
            ))}
          </select>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".py,.ts,.js,.java,.go,.cpp,.sql,.json,.txt"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1 text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded flex items-center gap-1.5 transition-colors whitespace-nowrap"
            title="Upload local raw code file"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload File
          </button>
        </div>
      </div>

      {/* Editor & Drop Zone */}
      <div
        className="relative flex-1 flex flex-col min-h-0 bg-neutral-950 font-mono text-xs"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="flex flex-1 min-h-[300px]">
          {/* Line Numbers column */}
          <div className="w-10 select-none py-3 bg-neutral-950/70 border-r border-neutral-800 text-right pr-2 text-neutral-600 font-mono text-xs leading-5">
            {Array.from({ length: Math.max(lineCount, 1) }).map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Raw Text Area (Whitespace & Indentation Preserved) */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 w-full p-3 bg-transparent text-neutral-200 resize-none font-mono text-xs leading-5 focus:outline-none selection:bg-neutral-800 overflow-auto whitespace-pre tab-4"
            placeholder="// Paste raw source code here or load a benchmark..."
          />
        </div>

        {/* Ingestion Triage Testing Bar (Slide 8) */}
        <div className="px-3 py-2 bg-neutral-950 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-neutral-400 font-mono">
            <span>
              Lines: <strong className="text-neutral-200 tabular-nums">{lineCount}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Payload: <strong className="text-neutral-200 tabular-nums">{byteCount} B</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Preserving exact whitespace &amp; CRLF
            </span>
          </div>

          {/* Test Triage Exceptions */}
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500 text-[11px] uppercase tracking-wider">Test Triage:</span>
            <button
              onClick={() => onSimulateTriageError('FileNotFoundError')}
              className="px-2 py-0.5 text-[11px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors"
              title="Simulate FileNotFoundError clean exit"
            >
              Missing File
            </button>
            <button
              onClick={() => onSimulateTriageError('PermissionError')}
              className="px-2 py-0.5 text-[11px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors"
              title="Simulate PermissionError access rejection"
            >
              Permission
            </button>
            <button
              onClick={() => onSimulateTriageError('UnicodeDecodeError')}
              className="px-2 py-0.5 text-[11px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors"
              title="Simulate binary characters / UnicodeDecodeError"
            >
              Binary Corrupt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
