import hljs from 'highlight.js';
import * as Diff from 'diff';

// Register core languages if needed or hljs already bundles major ones
export function highlightCode(code: string, language: string = 'plaintext'): string {
  if (!code) return '';
  try {
    const validLang = hljs.getLanguage(language) ? language : 'plaintext';
    return hljs.highlight(code, { language: validLang }).value;
  } catch (err) {
    return escapeHtml(code);
  }
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export function generateLineDiff(original: string, modified: string): DiffLine[] {
  const diffParts = Diff.diffLines(original, modified);
  const lines: DiffLine[] = [];

  let oldCounter = 1;
  let newCounter = 1;

  for (const part of diffParts) {
    // Split into individual lines while preserving line structure
    const splitLines = part.value.replace(/\r\n/g, '\n').split('\n');
    // If trailing item is empty string due to trailing newline, drop it if not the only item
    if (splitLines.length > 1 && splitLines[splitLines.length - 1] === '') {
      splitLines.pop();
    }

    for (const line of splitLines) {
      if (part.added) {
        lines.push({
          type: 'added',
          content: line,
          newLineNumber: newCounter++,
        });
      } else if (part.removed) {
        lines.push({
          type: 'removed',
          content: line,
          oldLineNumber: oldCounter++,
        });
      } else {
        lines.push({
          type: 'unchanged',
          content: line,
          oldLineNumber: oldCounter++,
          newLineNumber: newCounter++,
        });
      }
    }
  }

  return lines;
}
