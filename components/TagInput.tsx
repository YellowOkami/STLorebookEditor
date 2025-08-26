
import React from 'react';
import { useState } from 'react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export const TagInput: React.FC<TagInputProps> = ({ tags, onChange }) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !tags.includes(newTag)) {
        onChange([...tags, newTag]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 border border-[var(--color-border)] rounded-md bg-[var(--color-bg-primary)] focus-within:ring-2 focus-within:ring-[var(--color-accent)] focus-within:border-[var(--color-accent)]">
      {tags.map((tag, index) => (
        <div key={index} className="flex items-center bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] text-sm font-medium px-2 py-1 rounded-full">
          <span>{tag}</span>
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="ml-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            aria-label={`Remove ${tag} tag`}
          >
            &times;
          </button>
        </div>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Add a tag..."
        className="flex-grow bg-transparent focus:outline-none p-1 min-w-[100px] text-[var(--color-text-primary)]"
      />
    </div>
  );
};
