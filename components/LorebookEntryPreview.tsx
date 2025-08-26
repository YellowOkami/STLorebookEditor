
import React from 'react';
import type { LorebookEntry } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface LorebookEntryPreviewProps {
  entry: LorebookEntry;
}

export const LorebookEntryPreview: React.FC<LorebookEntryPreviewProps> = ({ entry }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl font-bold text-[var(--color-text-primary)]">{entry.comment || "Untitled Entry"}</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {entry.key.map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] text-xs font-semibold rounded-full">{tag}</span>
          ))}
        </div>
      </div>
      <div className="max-w-none p-4 bg-[var(--color-bg-primary)] rounded-lg border border-[var(--color-border)]">
        <MarkdownRenderer text={entry.content} />
      </div>
    </div>
  );
};
