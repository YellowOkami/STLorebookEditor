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
        <h3 className="text-2xl font-bold text-stone-900 dark:text-white">{entry.comment || "Untitled Entry"}</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {entry.key.map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200 text-xs font-semibold rounded-full">{tag}</span>
          ))}
        </div>
      </div>
      <div className="prose prose-stone dark:prose-invert max-w-none p-4 bg-stone-100 dark:bg-stone-900/50 rounded-lg border border-stone-200 dark:border-stone-700">
        <MarkdownRenderer text={entry.content} />
      </div>
    </div>
  );
};
