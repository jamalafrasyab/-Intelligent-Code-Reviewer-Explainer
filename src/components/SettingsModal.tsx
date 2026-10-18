import React from 'react';
import { X, Sliders, Shield, Zap, Lock, Info, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: 'analytical_gatekeeper' | 'security_auditor' | 'performance_specialist';
  setPersona: (p: 'analytical_gatekeeper' | 'security_auditor' | 'performance_specialist') => void;
  strictValidation: boolean;
  setStrictValidation: (v: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  persona,
  setPersona,
  strictValidation,
  setStrictValidation,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Pipeline Persona &amp; Constraints</h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 text-xs text-neutral-300">
          {/* Persona selector (Slide 10 & 11) */}
          <div className="space-y-2">
            <label className="font-semibold text-white block">
              Analytical Gatekeeper Persona (Slide 11)
            </label>
            <div className="space-y-2">
              <label
                onClick={() => setPersona('analytical_gatekeeper')}
                className={`p-3 rounded-lg border flex items-start gap-3 cursor-pointer transition-all ${
                  persona === 'analytical_gatekeeper'
                    ? 'border-emerald-500/60 bg-emerald-950/20 text-white'
                    : 'border-neutral-800 bg-neutral-950/40 hover:bg-neutral-800/40'
                }`}
              >
                <Shield className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold">Cold Analytical Senior QA (Default)</div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    Outputs only valid code blocks and direct bullet points. Zero conversational filler.
                  </div>
                </div>
              </label>

              <label
                onClick={() => setPersona('security_auditor')}
                className={`p-3 rounded-lg border flex items-start gap-3 cursor-pointer transition-all ${
                  persona === 'security_auditor'
                    ? 'border-emerald-500/60 bg-emerald-950/20 text-white'
                    : 'border-neutral-800 bg-neutral-950/40 hover:bg-neutral-800/40'
                }`}
              >
                <Lock className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold">Security &amp; Vulnerability Auditor</div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    Emphasizes memory safety, injection vectors, secret leaks, and unauthenticated routes.
                  </div>
                </div>
              </label>

              <label
                onClick={() => setPersona('performance_specialist')}
                className={`p-3 rounded-lg border flex items-start gap-3 cursor-pointer transition-all ${
                  persona === 'performance_specialist'
                    ? 'border-emerald-500/60 bg-emerald-950/20 text-white'
                    : 'border-neutral-800 bg-neutral-950/40 hover:bg-neutral-800/40'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold">High-Throughput Performance Specialist</div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    Focuses on Big-O algorithmic latency, concurrency locks, and memory allocation traps.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Strict Output Validation Toggle (Slide 12) */}
          <div className="pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Strict Output Validation (Slide 12)</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  Rejects response if either ## BUG_REPORT or ## REFACTORED_CODE header is omitted.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStrictValidation(!strictValidation)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  strictValidation ? 'bg-emerald-500' : 'bg-neutral-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    strictValidation ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Project 4 Kit Reference Notice */}
          <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 text-[11px] text-neutral-400 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
            <span>
              Configured for DecodeLabs Project 4: Intelligent Code Reviewer &amp; Explainer.
              Model: <strong className="text-neutral-200">gemini-3.8-flash</strong>.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-neutral-950 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
          >
            Apply Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
