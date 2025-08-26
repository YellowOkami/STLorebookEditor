
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
    <div className="flex flex-wrap items-center gap-2 p-2 border border-stone-300 dark:border-stone-600 rounded-md bg-stone-50 dark:bg-stone-700 focus-within:ring-2 focus-within:ring-stone-500 focus-within:border-stone-500">
      {tags.map((tag, index) => (
        <div key={index} className="flex items-center bg-stone-200 text-stone-700 dark:bg-stone-600 dark:text-stone-200 text-sm font-medium px-2 py-1 rounded-full">
          <span>{tag}</span>
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="ml-2 text-stone-500 dark:text-stone-300 hover:text-stone-800 dark:hover:text-stone-100"
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
        className="flex-grow bg-transparent focus:outline-none p-1 min-w-[100px]"
      />
    </div>
  );
};