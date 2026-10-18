import React from 'react';
import { X, AlertOctagon, ShieldAlert, Binary, CheckCircle2 } from 'lucide-react';

interface TriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorType: 'FileNotFoundError' | 'PermissionError' | 'UnicodeDecodeError' | null;
}

export const TriageModal: React.FC<TriageModalProps> = ({
  isOpen,
  onClose,
  errorType,
}) => {
  if (!isOpen || !errorType) return null;

  const data = {
    FileNotFoundError: {
      title: 'FileNotFoundError — Clean Ingestion Abort',
      icon: AlertOctagon,
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/20 border-amber-900/40',
      cause: 'The specified codebase path does not point to an existing or readable file entity.',
      rule: 'Slide 8: Trigger clean exit with clear explanation rather than crashing Python context managers.',
      action: 'Check directory relative path, ensure file existence, or use the drag & drop file uploader.',
      pythonSample: `try:
    with open(target_path, 'r', encoding='utf-8') as f:
        payload = f.read()
except FileNotFoundError as err:
    print(f"[TRIAGE EXIT] Specified path '{target_path}' not found: {err}")
    sys.exit(1)`,
    },
    PermissionError: {
      title: 'PermissionError — Access Rejection',
      icon: ShieldAlert,
      color: 'text-rose-400',
      bgColor: 'bg-rose-950/20 border-rose-900/40',
      cause: 'The file or process runtime possesses restricted read or execution permissions (e.g., chmod 000).',
      rule: 'Slide 8: Safely reject access attempt without leaking filesystem internal structure or raising unhandled tracebacks.',
      action: 'Verify OS filesystem read permissions or adjust file ownership before attaching to memory buffer.',
      pythonSample: `try:
    with open(target_path, 'r', encoding='utf-8') as f:
        payload = f.read()
except PermissionError:
    print(f"[TRIAGE SECURITY] Access denied reading '{target_path}'. Safely aborting.")
    sys.exit(1)`,
    },
    UnicodeDecodeError: {
      title: 'UnicodeDecodeError — Non-UTF-8 Binary Triage',
      icon: Binary,
      color: 'text-sky-400',
      bgColor: 'bg-sky-950/20 border-sky-900/40',
      cause: 'Unexpected non-textual or binary bytes detected in the code payload buffer.',
      rule: 'Slide 8: Fallback to robust codecs or throw validation flags to prevent downstream API pipeline crashes.',
      action: 'Sanitize binary control characters or ensure file is UTF-8 encoded text before streaming.',
      pythonSample: `try:
    payload = raw_bytes.decode('utf-8')
except UnicodeDecodeError:
    payload = raw_bytes.decode('utf-8', errors='replace')
    print("[TRIAGE WARNING] Binary assets detected. Replaced invalid bytes with unicode replacement characters.")`,
    },
  }[errorType];

  const Icon = data.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="px-5 py-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${data.color}`} />
            <h3 className="text-sm font-semibold text-white">Slide 8: Input Ingestion Triage Simulator</h3>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs text-neutral-300">
          <div className={`p-3.5 rounded-lg border ${data.bgColor} space-y-1.5`}>
            <div className={`font-semibold ${data.color} flex items-center gap-1.5 text-sm`}>
              <Icon className="w-4 h-4" />
              <span>{data.title}</span>
            </div>
            <p className="text-neutral-200">{data.cause}</p>
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-white">Architectural Rule (Slide 8):</span>
            <p className="text-neutral-400 leading-relaxed">{data.rule}</p>
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-white">Recommended Pipeline Defense:</span>
            <pre className="p-3 bg-neutral-950 border border-neutral-800 rounded font-mono text-[11px] text-emerald-300 overflow-x-auto whitespace-pre">
              {data.pythonSample}
            </pre>
          </div>
        </div>

        <div className="px-5 py-3 bg-neutral-950 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            Acknowledge Triage
          </button>
        </div>
      </div>
    </div>
  );
};
