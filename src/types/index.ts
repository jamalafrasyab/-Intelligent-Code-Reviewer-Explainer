export interface BugItem {
  id: string;
  raw: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'syntax' | 'logic' | 'performance' | 'security' | 'concurrency';
  lineHint?: string;
}

export interface ReviewResponse {
  success: boolean;
  rawResponse?: string;
  error?: string;
  errorType?: string;
  triageFailed?: boolean;
  validation?: {
    hasBugReportHeader: boolean;
    hasRefactoredCodeHeader: boolean;
    passed?: boolean;
    rejected?: boolean;
  };
  parsed?: {
    bugReportRaw: string;
    bugs: BugItem[];
    refactoredCode: string;
    explanation: string;
  };
  telemetry?: {
    elapsedMs: number;
    originalLineCount: number;
    refactoredLineCount: number;
    originalByteSize: number;
    refactoredByteSize: number;
    model: string;
  };
}

export interface SampleFile {
  id: string;
  filename: string;
  language: string;
  title: string;
  description: string;
  code: string;
  targetBugs: string[];
}

export type ViewTab = 'ide' | 'terminal' | 'pipeline' | 'bugs';
