
import React from 'react';

interface MarkdownRendererProps {
  text: string;
}

const parseMarkdown = (text: string): string => {
  let html = text;

  // Escape HTML to prevent XSS, though less critical in a local-only app.
  html = html.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // ### Heading
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-4 mb-2">$1</h3>');
  
  // **Bold**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
  
  // *Italic*
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // `Inline code`
  html = html.replace(/`([^`]+)`/g, '<code class="bg-stone-200 dark:bg-stone-700 rounded px-1.5 py-0.5 font-mono text-sm text-stone-800 dark:text-stone-200">$1</code>');
  
  // * list item
  html = html.replace(/^\s*[\*\-\+]\s+(.*$)/gim, '<div class="flex items-start pl-4"><span class="mr-2">&bull;</span><div class="flex-1">$1</div></div>');

  // Newlines to paragraphs
  return html.split('\n').map(paragraph => {
    // Avoid wrapping our custom list item divs in <p> tags
    if (paragraph.startsWith('<div')) {
      return paragraph;
    }
    return paragraph.trim() === '' ? '<br/>' : `<p>${paragraph}</p>`
  }).join('');
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ text }) => {
  const processedHtml = parseMarkdown(text);

  return <div dangerouslySetInnerHTML={{ __html: processedHtml }} />;
};