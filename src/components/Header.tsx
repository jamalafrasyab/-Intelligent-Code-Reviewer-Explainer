import React from 'react';
import { ShieldCheck, Play, Loader2, Sparkles, SlidersHorizontal } from 'lucide-react';
import { ViewTab } from '../types/index.ts';

interface HeaderProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  isRunning: boolean;
  onRunAudit: () => void;
  onOpenSettings: () => void;
  hasResult: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  isRunning,
  onRunAudit,
  onOpenSettings,
  hasResult,
}) => {
  return (
    <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="leading-tight">
            <span className="text-base font-semibold text-white tracking-tight block whitespace-nowrap">
              DecodeLabs Gatekeeper
            </span>
            <div className="flex items-center gap-1.5 text-xs text-neutral-400">
              <span>Project 4</span>
              <span aria-hidden="true">·</span>
              <span>Batch 2026</span>
              <span aria-hidden="true">·</span>
              <span>IPO Architecture</span>
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Single-line, unboxed, subtle hover states) */}
        <nav className="hidden md:flex items-center gap-1 shrink-0">
          <button
            onClick={() => onTabChange('ide')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'ide'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            IDE Split Diff
          </button>
          <button
            onClick={() => onTabChange('terminal')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'terminal'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            Rich Terminal
          </button>
          <button
            onClick={() => onTabChange('bugs')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'bugs'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            Bug Report &amp; Logic
          </button>
          <button
            onClick={() => onTabChange('pipeline')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'pipeline'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            IPO Pipeline
          </button>
        </nav>

        {/* Zone 3: Primary Action & Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenSettings}
            title="Configure Persona &amp; Constraints"
            className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button
            onClick={onRunAudit}
            disabled={isRunning}
            className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-all shadow-sm whitespace-nowrap ${
              isRunning
                ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold active:scale-[0.98]'
            }`}
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Auditing Stream...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{hasResult ? 'Re-Audit Code' : 'Execute Audit'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
