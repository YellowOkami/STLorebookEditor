
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import type { Lorebook, LorebookEntry } from './types';
import { LorebookEntryEditor } from './components/LorebookEntryEditor';
import { LorebookEntryPreview } from './components/LorebookEntryPreview';
import { UploadIcon, DownloadIcon, PlusIcon, DeleteIcon, LinkIcon, CheckIcon, DragHandleIcon, SaveIcon, CancelIcon, PreviewIcon, EditIcon, ChevronDownIcon, ChevronUpIcon } from './components/Icons';
import { TagInput } from './components/TagInput';

// Simple SVG icon components for status indicators
const GreenCircleIcon: React.FC = () => <svg viewBox="0 0 10 10" className="w-4 h-4"><circle cx="5" cy="5" r="5" fill="#4ade80" /></svg>;
const BlueCircleIcon: React.FC = () => <svg viewBox="0 0 10 10" className="w-4 h-4"><circle cx="5" cy="5" r="5" fill="#60a5fa" /></svg>;

// A reusable, styled toggle switch component
const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void; }> = ({ enabled, onChange }) => (
    <button
      onClick={(e) => { e.stopPropagation(); onChange(!enabled); }}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-100 dark:focus:ring-offset-stone-800 focus:ring-stone-500 ${enabled ? 'bg-stone-600' : 'bg-stone-300 dark:bg-stone-600'}`}
      role="switch"
      aria-checked={enabled}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
);

// This component displays a lorebook entry card with controls to preview, edit, and delete.
const LorebookEntryCard: React.FC<{
  entry: LorebookEntry;
  onUpdate: (entry: LorebookEntry) => void;
  onEdit: (entry: LorebookEntry) => void;
  onPreview: (entry: LorebookEntry) => void;
  onDelete: (uid: number) => void;
  openDropdownUid: number | null;
  setOpenDropdownUid: (uid: number | null) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  isDragging: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}> = ({ entry, onUpdate, onEdit, onPreview, onDelete, openDropdownUid, setOpenDropdownUid, onDragStart, onDragOver, onDrop, onDragEnd, isDragging, isExpanded, onToggleExpand }) => {

  const dropdownRef = useRef<HTMLDivElement>(null);
  const addTagInputRef = useRef<HTMLInputElement>(null);
  const editTagInputRef = useRef<HTMLInputElement>(null);
  const isDropdownOpen = openDropdownUid === entry.uid;

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(entry.comment);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagValue, setNewTagValue] = useState('');
  const [editingTag, setEditingTag] = useState<{ index: number; value: string } | null>(null);

  useEffect(() => {
    if (isAddingTag) addTagInputRef.current?.focus();
  }, [isAddingTag]);

  useEffect(() => {
    if (editingTag) editTagInputRef.current?.focus();
  }, [editingTag]);

  const getStatus = () => {
    if (entry.vectorized) return { Icon: LinkIcon, tooltip: 'Vectorized', color: 'text-stone-500' };
    if (entry.constant) return { Icon: BlueCircleIcon, tooltip: 'Always Active (Constant)' };
    return { Icon: GreenCircleIcon, tooltip: 'Keyword Triggered' };
  };

  const handleActivationChange = (newState: { vectorized: boolean, constant: boolean }) => {
    onUpdate({ ...entry, ...newState });
    setOpenDropdownUid(null);
  };
  
  const handleToggleDisable = () => {
    onUpdate({ ...entry, disable: !entry.disable });
  };
  
  const handleDropdownToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      setOpenDropdownUid(isDropdownOpen ? null : entry.uid);
  };

  const handleTitleSave = () => {
      if (titleValue.trim() !== entry.comment) {
          onUpdate({ ...entry, comment: titleValue.trim() });
      }
      setIsEditingTitle(false);
  };
  
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleTitleSave();
      if (e.key === 'Escape') {
          setTitleValue(entry.comment);
          setIsEditingTitle(false);
      }
  };
  
  const handleAddTag = () => {
      const newTag = newTagValue.trim();
      if (newTag && !entry.key.includes(newTag)) {
          onUpdate({ ...entry, key: [...entry.key, newTag] });
      }
      setNewTagValue('');
      setIsAddingTag(false);
  };
  
  const handleNewTagKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        handleAddTag();
      }
      if (e.key === 'Escape') {
        setNewTagValue('');
        setIsAddingTag(false);
      }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdate({ ...entry, key: entry.key.filter(tag => tag !== tagToRemove) });
  };

  const handleEditTag = (index: number) => {
      setEditingTag({ index, value: entry.key[index] });
  };
  
  const handleTagSave = () => {
      if (!editingTag) return;
      const trimmedValue = editingTag.value.trim();
      const newTags = [...entry.key];
  
      if (!trimmedValue) {
          // If tag is empty, remove it
          newTags.splice(editingTag.index, 1);
      } else if (trimmedValue !== entry.key[editingTag.index] && !newTags.includes(trimmedValue)) {
          // If tag has changed and is not a duplicate, update it
          newTags[editingTag.index] = trimmedValue;
      }
      
      onUpdate({ ...entry, key: newTags });
      setEditingTag(null);
  };
  
  const handleEditTagKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleTagSave();
      if (e.key === 'Escape') setEditingTag(null);
  };

  const { Icon, tooltip, color } = getStatus();
  
  const buttonClass = "p-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors rounded-full hover:bg-stone-100 dark:hover:bg-stone-700";

  return (
    <div 
        className={`bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 shadow-sm transition-all duration-300 ${entry.disable ? 'opacity-50 grayscale' : ''} ${isDragging ? 'opacity-30' : 'opacity-100'}`}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
    >
        <div className="flex justify-between items-center p-4 cursor-pointer" onClick={onToggleExpand}>
            <div className="flex items-center gap-3 flex-grow min-w-0">
                <div onDragStart={onDragStart} draggable="true" className="cursor-move text-stone-400 hover:text-stone-600 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <DragHandleIcon />
                </div>
                <div className="min-w-0 flex-grow">
                    {isEditingTitle ? (
                         <input
                            type="text"
                            value={titleValue}
                            onChange={(e) => setTitleValue(e.target.value)}
                            onBlur={handleTitleSave}
                            onKeyDown={handleTitleKeyDown}
                            className="text-xl font-bold bg-transparent border-b-2 border-stone-400 focus:border-stone-500 outline-none w-full text-stone-900 dark:text-white"
                            autoFocus
                            onClick={e => e.stopPropagation()}
                        />
                    ) : (
                        <h3 onClick={(e) => { e.stopPropagation(); setIsEditingTitle(true); }} className="text-xl font-bold text-stone-900 dark:text-white truncate inline-block cursor-text p-1 -m-1 rounded hover:bg-stone-200 dark:hover:bg-stone-700">{entry.comment || "Untitled Entry"}</h3>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2 items-center" onClick={e => e.stopPropagation()}>
                        {entry.key.map((tag, index) => (
                             editingTag?.index === index ? (
                                <input
                                    ref={editTagInputRef}
                                    type="text"
                                    value={editingTag.value}
                                    onChange={e => setEditingTag({ ...editingTag, value: e.target.value })}
                                    onBlur={handleTagSave}
                                    onKeyDown={handleEditTagKeyDown}
                                    className="bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200 text-xs font-semibold px-2 py-0.5 rounded-full outline-none w-24"
                                />
                             ) : (
                                <div key={index} className="flex items-center bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200 text-xs font-semibold pl-2 pr-1 py-0.5 rounded-full">
                                    <span onClick={() => handleEditTag(index)}>{tag}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTag(tag)}
                                        className="ml-1.5 text-stone-500 dark:text-stone-300 hover:text-stone-800 dark:hover:text-stone-100 rounded-full w-4 h-4 flex items-center justify-center"
                                        aria-label={`Remove ${tag} tag`}
                                    >
                                        &times;
                                    </button>
                                </div>
                             )
                        ))}
                        {isAddingTag ? (
                            <input
                                ref={addTagInputRef}
                                type="text"
                                value={newTagValue}
                                onChange={e => setNewTagValue(e.target.value)}
                                onKeyDown={handleNewTagKeyDown}
                                onBlur={handleAddTag}
                                className="bg-transparent outline-none text-xs w-24 border-b border-stone-400"
                                placeholder="Add tag..."
                            />
                        ) : (
                             <button onClick={() => setIsAddingTag(true)} className="flex items-center justify-center w-5 h-5 bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 rounded-full hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors">
                                <PlusIcon />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex-shrink-0 flex items-center gap-1 ml-4" onClick={e => e.stopPropagation()}>
                <ToggleSwitch enabled={!entry.disable} onChange={handleToggleDisable} />
                <div className="relative" ref={dropdownRef}>
                    <button onClick={handleDropdownToggle} className={`relative flex items-center justify-center p-2 group rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 ${color}`} title={tooltip}>
                        <Icon />
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md shadow-lg z-10">
                            <div className="py-1">
                                <button onClick={() => handleActivationChange({ constant: false, vectorized: false })} className="flex justify-between items-center w-full px-4 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-600">
                                    <div className="flex items-center gap-2"><GreenCircleIcon /> Keyword Triggered</div>
                                    {!entry.constant && !entry.vectorized && <CheckIcon />}
                                </button>
                                <button onClick={() => handleActivationChange({ constant: true, vectorized: false })} className="flex justify-between items-center w-full px-4 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-600">
                                    <div className="flex items-center gap-2"><BlueCircleIcon /> Constant</div>
                                    {entry.constant && <CheckIcon />}
                                </button>
                                <button onClick={() => handleActivationChange({ constant: false, vectorized: true })} className="flex justify-between items-center w-full px-4 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-600">
                                    <div className="flex items-center gap-2"><LinkIcon /> Vectorized</div>
                                    {entry.vectorized && <CheckIcon />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="w-px h-6 bg-stone-200 dark:bg-stone-700 mx-1"></div>
                 <button onClick={(e) => { e.stopPropagation(); onPreview(entry); }} className={buttonClass} aria-label={`Preview ${entry.comment}`}><PreviewIcon /></button>
                 <button onClick={(e) => { e.stopPropagation(); onEdit(entry); }} className={buttonClass} aria-label={`Edit ${entry.comment}`}><EditIcon /></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(entry.uid); }} className={`${buttonClass} hover:text-red-600 dark:hover:text-red-500`} aria-label={`Delete ${entry.comment}`}>
                    <DeleteIcon />
                </button>
                 <div className="text-stone-400 ml-2">
                    {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </div>
            </div>
        </div>
        {isExpanded && (
            <div className="p-4 md:p-6 border-t border-stone-200 dark:border-stone-700">
                <LorebookEntryEditor 
                    entry={entry} 
                    onChange={(field, value) => onUpdate({ ...entry, [field]: value })}
                />
            </div>
        )}
    </div>
  );
};

// Reusable form control components and styles for the new editor modal
const inputClass = "w-full px-2 py-1 bg-stone-50 dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-sm";
const labelClass = "block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1";

const CheckboxField: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void; }> = ({ label, checked, onChange }) => (
    <label className="flex items-center space-x-2 cursor-pointer select-none">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="form-checkbox h-4 w-4 rounded text-stone-600 bg-stone-200 dark:bg-stone-600 border-stone-300 dark:border-stone-500 focus:ring-stone-500" />
        <span className="text-sm text-stone-700 dark:text-stone-300">{label}</span>
    </label>
);

const NumberField: React.FC<{ label: string; value: number | null; onChange: (value: number | null) => void; placeholder?: string; }> = ({ label, value, onChange, placeholder }) => (
    <div>
        <label className={labelClass}>{label}</label>
        <input
            type="number"
            value={value === null || value === undefined ? '' : value}
            onChange={(e) => onChange(e.target.value === '' ? null : parseInt(e.target.value, 10))}
            placeholder={placeholder}
            className={inputClass}
        />
    </div>
);

const TriStateSelect: React.FC<{ label: string; value: boolean | null; onChange: (value: boolean | null) => void; }> = ({ label, value, onChange }) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (e.target.value === 'global') onChange(null);
        else if (e.target.value === 'true') onChange(true);
        else onChange(false);
    };
    const selectValue = value === null || value === undefined ? 'global' : value ? 'true' : 'false';

    return (
        <div>
            <label className={labelClass}>{label}</label>
            <select value={selectValue} onChange={handleChange} className={inputClass}>
                <option value="global">Use global</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
            </select>
        </div>
    );
};

// A modal component for editing a lorebook entry, redesigned to match the user's image.
const EditorModal: React.FC<{
    initialEntry: LorebookEntry;
    onSave: (entry: LorebookEntry) => void;
    onCancel: () => void;
}> = ({ initialEntry, onSave, onCancel }) => {
    const [entry, setEntry] = useState(initialEntry);
    const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);

    const handleChange = (field: keyof LorebookEntry, value: any) => {
        setEntry(prev => ({ ...prev, [field]: value }));
    };
    
    const handleCheckboxChange = (field: keyof LorebookEntry) => (checked: boolean) => {
        handleChange(field, checked);
    };

    const handleSave = () => {
        onSave(entry);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 overflow-y-auto" onClick={onCancel}>
            <div className="bg-stone-50 dark:bg-stone-800 rounded-lg shadow-2xl w-full max-w-5xl h-5/6 flex flex-col" onClick={e => e.stopPropagation()}>
                <main className="p-6 space-y-6 flex-grow flex flex-col min-h-0">
                    <div>
                        <label htmlFor="edit-title" className={labelClass}>Title</label>
                        <input id="edit-title" type="text" value={entry.comment} onChange={e => handleChange('comment', e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Tags</label>
                        <TagInput tags={entry.key} onChange={newTags => handleChange('key', newTags)} />
                    </div>
                    <div className="flex flex-col flex-grow min-h-0">
                        <label htmlFor="edit-content" className={labelClass}>Content</label>
                        <textarea id="edit-content" value={entry.content} onChange={e => handleChange('content', e.target.value)} className={`${inputClass} font-mono text-sm resize-y flex-grow`} placeholder="Enter your lore here... Markdown is supported."/>
                    </div>
                    
                    <div className="border-t border-stone-200 dark:border-stone-700">
                        <button onClick={() => setAdvancedSettingsOpen(!advancedSettingsOpen)} className="flex justify-between items-center w-full text-left py-3 font-semibold text-lg text-stone-800 dark:text-stone-200">
                            <span>Advanced Settings</span>
                            {advancedSettingsOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                        </button>
                        {advancedSettingsOpen && (
                            <div className="pt-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                                    <div>
                                        <label className={labelClass}>Logic</label>
                                        <select value={entry.selectiveLogic} onChange={(e) => handleChange('selectiveLogic', parseInt(e.target.value))} className={inputClass}>
                                            <option value={0}>AND ANY</option>
                                            <option value={1}>AND ALL</option>
                                            <option value={2}>NOT ALL</option>
                                            <option value={3}>NOT ANY</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Optional Filter</label>
                                        <TagInput tags={entry.keysecondary} onChange={(newTags) => handleChange('keysecondary', newTags)} />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <NumberField label="Scan Depth" value={entry.scanDepth} onChange={(v) => handleChange('scanDepth', v)} placeholder="Global"/>
                                    <TriStateSelect label="Case-Sensitive" value={entry.caseSensitive} onChange={(v) => handleChange('caseSensitive', v)} />
                                    <TriStateSelect label="Whole Words" value={entry.matchWholeWords} onChange={(v) => handleChange('matchWholeWords', v)} />
                                     <div>
                                         <label className={labelClass}>Automation ID</label>
                                         <input type="text" value={entry.automationId} onChange={e => handleChange('automationId', e.target.value)} className={inputClass} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2">
                                    <CheckboxField label="Non-recursable" checked={entry.excludeRecursion} onChange={handleCheckboxChange('excludeRecursion')} />
                                    <CheckboxField label="Delay until recursion" checked={entry.delayUntilRecursion} onChange={handleCheckboxChange('delayUntilRecursion')} />
                                    <CheckboxField label="Prevent further recursion" checked={entry.preventRecursion} onChange={handleCheckboxChange('preventRecursion')} />
                                    <CheckboxField label="Ignore budget" checked={entry.ignoreBudget} onChange={handleCheckboxChange('ignoreBudget')} />
                                </div>

                                <div className="border-t border-stone-200 dark:border-stone-700 pt-4">
                                    <h4 className="font-semibold text-stone-800 dark:text-stone-200 mb-2">Inclusion Group</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-end">
                                        <div className="md:col-span-2">
                                            <label className={labelClass}>Group Label</label>
                                            <input type="text" value={entry.group} onChange={e => handleChange('group', e.target.value)} placeholder="Only one entry with the same label will be activated" className={inputClass} />
                                        </div>
                                        <NumberField label="Group Weight" value={entry.groupWeight} onChange={v => handleChange('groupWeight', v)} />
                                        <NumberField label="Sticky" value={entry.sticky} onChange={v => handleChange('sticky', v)} />
                                        <NumberField label="Cooldown" value={entry.cooldown} onChange={v => handleChange('cooldown', v)} />
                                        <NumberField label="Delay" value={entry.delay} onChange={v => handleChange('delay', v)} />
                                        <CheckboxField label="Prioritize" checked={entry.groupOverride} onChange={handleCheckboxChange('groupOverride')} />
                                    </div>
                                </div>

                                <div className="border-t border-stone-200 dark:border-stone-700 pt-4">
                                    <label className={labelClass}>Filter to Characters or Tags</label>
                                    <TagInput tags={entry.triggers} onChange={(newTags) => handleChange('triggers', newTags)} />
                                </div>

                                <div className="border-t border-stone-200 dark:border-stone-700 pt-4">
                                     <h4 className="font-semibold text-stone-800 dark:text-stone-200 mb-2">Additional Matching Sources</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
                                        <CheckboxField label="Character Description" checked={entry.matchCharacterDescription} onChange={handleCheckboxChange('matchCharacterDescription')} />
                                        <CheckboxField label="Persona Description" checked={entry.matchPersonaDescription} onChange={handleCheckboxChange('matchPersonaDescription')} />
                                        <CheckboxField label="Character Personality" checked={entry.matchCharacterPersonality} onChange={handleCheckboxChange('matchCharacterPersonality')} />
                                        <CheckboxField label="Scenario" checked={entry.matchScenario} onChange={handleCheckboxChange('matchScenario')} />
                                        <CheckboxField label="Creator's Notes" checked={entry.matchCreatorNotes} onChange={handleCheckboxChange('matchCreatorNotes')} />
                                        <CheckboxField label="Character Depth Prompt" checked={entry.matchCharacterDepthPrompt} onChange={handleCheckboxChange('matchCharacterDepthPrompt')} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
                <footer className="flex justify-end items-center gap-3 p-4 border-t border-stone-200 dark:border-stone-700 flex-shrink-0">
                    <button onClick={onCancel} className="flex items-center gap-2 bg-stone-200 dark:bg-stone-600 text-stone-800 dark:text-stone-200 font-semibold py-2 px-4 rounded-lg hover:bg-stone-300 dark:hover:bg-stone-500 transition-colors">
                        <CancelIcon /> Cancel
                    </button>
                    <button onClick={handleSave} className="flex items-center gap-2 bg-stone-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-stone-700 transition-colors">
                        <SaveIcon /> Save
                    </button>
                </footer>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [lorebook, setLorebook] = useState<Lorebook | null>(null);
  const [lorebookName, setLorebookName] = useState<string>('lorebook');
  const [editingEntry, setEditingEntry] = useState<LorebookEntry | null>(null);
  const [previewingEntry, setPreviewingEntry] = useState<LorebookEntry | null>(null);
  const [openDropdownUid, setOpenDropdownUid] = useState<number | null>(null);
  const [expandedUid, setExpandedUid] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draggedUid, setDraggedUid] = useState<number | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = () => {
        if (openDropdownUid !== null) {
            setOpenDropdownUid(null);
        }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [openDropdownUid]);

  const handleToggleExpand = (uid: number) => {
    setExpandedUid(prev => (prev === uid ? null : uid));
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error("File content is not a string.");
        }
        const data = JSON.parse(text);
        if (data && typeof data.entries === 'object' && data.entries !== null) {
          Object.values(data.entries).forEach((entry: any, index: number) => {
            if (typeof entry.displayIndex !== 'number') {
              entry.displayIndex = index;
            }
          });
          setLorebook(data);
          const filename = file.name.replace(/\.[^/.]+$/, "");
          setLorebookName(filename);
          setError(null);
        } else {
          throw new Error("Invalid lorebook format. Missing 'entries' object.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse JSON file.");
        setLorebook(null);
      }
    };
    reader.onerror = () => {
        setError("Failed to read file.");
        setLorebook(null);
    }
    reader.readAsText(file);
  };
  
  const handleCreateLorebook = () => {
    setLorebook({ entries: {} });
    setLorebookName('new-lorebook');
    setError(null);
    setEditingEntry(null);
    setPreviewingEntry(null);
    setOpenDropdownUid(null);
    setExpandedUid(null);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleExportClick = () => {
    if (!lorebook) return;

    const jsonString = JSON.stringify(lorebook, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${lorebookName || 'lorebook'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleUpdateEntry = (updatedEntry: LorebookEntry) => {
    if (!lorebook) return;
    setLorebook(prev => {
      if (!prev) return null;
      const newEntries = { ...prev.entries };
      const keyToUpdate = Object.keys(newEntries).find(k => newEntries[k].uid === updatedEntry.uid);
      if (keyToUpdate) {
          newEntries[keyToUpdate] = updatedEntry;
      }
      return { ...prev, entries: newEntries };
    });
    if (editingEntry?.uid === updatedEntry.uid) {
      setEditingEntry(null); // Close modal on save if it was open
    }
  };

  const handleDeleteEntry = (uid: number) => {
    if (!lorebook) return;
    setLorebook(prev => {
      if (!prev) return null;
      const newEntries = { ...prev.entries };
      const keyToDelete = Object.keys(newEntries).find(k => newEntries[k].uid === uid);
      if (keyToDelete) {
        delete newEntries[keyToDelete];
      }
      return { ...prev, entries: newEntries };
    });
  };

  const handleAddEntry = () => {
    if (!lorebook) return;
    const existingUids = Object.values(lorebook.entries).map(e => e.uid);
    const maxUid = existingUids.length > 0 ? Math.max(...existingUids) : -1;
    const newUid = maxUid + 1;
    const newDisplayIndex = lorebook ? Object.keys(lorebook.entries).length : 0;

    const newEntry: LorebookEntry = {
        uid: newUid, key: [], comment: "New Entry", content: "", displayIndex: newDisplayIndex,
        keysecondary: [], constant: false, vectorized: false, selective: true, selectiveLogic: 0,
        addMemo: true, order: 100, position: 0, disable: false, ignoreBudget: false, excludeRecursion: false,
        preventRecursion: false, matchPersonaDescription: false, matchCharacterDescription: false,
        matchCharacterPersonality: false, matchCharacterDepthPrompt: false, matchScenario: false,
        matchCreatorNotes: false, delayUntilRecursion: false, probability: 100, useProbability: true,
        depth: 4, group: "", groupOverride: false, groupWeight: 100, scanDepth: null, caseSensitive: null,
        matchWholeWords: null, useGroupScoring: null, automationId: "", role: null, sticky: 0,
        cooldown: 0, delay: 0, triggers: []
    };
    
    const newKey = `entry-${newUid}`;
    setLorebook(prev => {
        if (!prev) return null;
        const newEntries = { ...prev.entries, [newKey]: newEntry };
        return { ...prev, entries: newEntries };
    });
    setExpandedUid(newUid);
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, uid: number) => {
    setDraggedUid(uid);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent, dropUid: number) => {
    e.preventDefault();
    if (draggedUid === null || draggedUid === dropUid || !lorebook) return;

    const entriesArray = Object.values(lorebook.entries).sort((a, b) => a.displayIndex - b.displayIndex);
    const draggedIndex = entriesArray.findIndex(entry => entry.uid === draggedUid);
    const dropIndex = entriesArray.findIndex(entry => entry.uid === dropUid);

    if (draggedIndex === -1 || dropIndex === -1) return;

    const newEntriesArray = [...entriesArray];
    const [draggedItem] = newEntriesArray.splice(draggedIndex, 1);
    newEntriesArray.splice(dropIndex, 0, draggedItem);
    
    const updatedEntries = { ...lorebook.entries };
    newEntriesArray.forEach((entry, index) => {
      const keyToUpdate = Object.keys(updatedEntries).find(k => updatedEntries[k].uid === entry.uid);
      if (keyToUpdate) {
          updatedEntries[keyToUpdate].displayIndex = index;
      }
    });

    setLorebook({ ...lorebook, entries: updatedEntries });
    setDraggedUid(null);
  };
  
  const handleDragEnd = () => {
      setDraggedUid(null);
  };

  const sortedEntries = lorebook ? Object.values(lorebook.entries).sort((a, b) => a.displayIndex - b.displayIndex) : [];
  
  return (
    <div className="min-h-screen font-sans flex flex-col">
      <header className="sticky top-0 z-20 bg-stone-50/80 dark:bg-stone-800/80 backdrop-blur-sm border-b border-stone-200 dark:border-stone-700">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">SillyTavern Lorebook Editor</h1>
           {lorebook && (
            <div className="flex items-center gap-2 flex-grow sm:flex-grow-0">
                <label htmlFor="lorebookName" className="font-semibold text-sm text-stone-700 dark:text-stone-300">Book Name:</label>
                <input
                    id="lorebookName"
                    type="text"
                    value={lorebookName}
                    onChange={(e) => setLorebookName(e.target.value)}
                    className="w-full sm:w-auto px-3 py-1 bg-stone-50 dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm focus:outline-none focus:ring-stone-500 focus:border-stone-500 text-sm"
                />
            </div>
          )}
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
            <button onClick={handleCreateLorebook} className="flex items-center gap-2 bg-stone-200 dark:bg-stone-600 text-stone-800 dark:text-stone-200 font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-stone-300 dark:hover:bg-stone-500 transition-colors">
                <PlusIcon /> Create New
            </button>
            <button onClick={handleImportClick} className="flex items-center gap-2 bg-stone-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-stone-700 transition-colors">
              <UploadIcon /> Import
            </button>
            <button onClick={handleExportClick} disabled={!lorebook} className="flex items-center gap-2 bg-stone-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-stone-600 transition-colors disabled:bg-stone-400 disabled:dark:bg-stone-600 disabled:cursor-not-allowed">
              <DownloadIcon /> Export
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 flex-grow w-full">
        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline ml-2">{error}</span>
            </div>
        )}

        {!lorebook ? (
          <div className="text-center py-20 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 shadow-sm">
            <h2 className="text-3xl font-semibold mb-4">Welcome!</h2>
            <p className="text-stone-600 dark:text-stone-400 mb-6">Import a SillyTavern `lorebook.json` file or create a new one to begin.</p>
            <div className="flex justify-center items-center gap-4">
                <button onClick={handleCreateLorebook} className="bg-stone-200 text-stone-800 font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-stone-300 transition-transform transform hover:scale-105">
                    Create New Lorebook
                </button>
                <button onClick={handleImportClick} className="bg-stone-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-stone-700 transition-transform transform hover:scale-105">
                    Import Lorebook
                </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-end mb-4">
                 <button onClick={handleAddEntry} className="flex items-center gap-2 bg-stone-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-stone-700 transition-colors">
                    <PlusIcon /> Add Entry
                </button>
            </div>
            <div className="space-y-4">
              {sortedEntries.map((entry) => (
                <LorebookEntryCard
                  key={entry.uid}
                  entry={entry}
                  onUpdate={handleUpdateEntry}
                  onEdit={() => setEditingEntry(entry)}
                  onPreview={() => setPreviewingEntry(entry)}
                  onDelete={handleDeleteEntry}
                  openDropdownUid={openDropdownUid}
                  setOpenDropdownUid={setOpenDropdownUid}
                  onDragStart={(e) => handleDragStart(e, entry.uid)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, entry.uid)}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedUid === entry.uid}
                  isExpanded={expandedUid === entry.uid}
                  onToggleExpand={() => handleToggleExpand(entry.uid)}
                />
              ))}
            </div>
          </div>
        )}
      </main>
      
      <footer className="text-center py-4">
        <p className="text-sm text-stone-500 dark:text-stone-400">Made by YellowOkami</p>
      </footer>

      {previewingEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4" onClick={() => setPreviewingEntry(null)}>
            <div className="bg-stone-50 dark:bg-stone-800 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-stone-200 dark:border-stone-700 flex-shrink-0">
                    <h2 className="text-xl font-bold">Preview Entry</h2>
                    <button onClick={() => setPreviewingEntry(null)} className="text-2xl font-bold p-2 leading-none text-stone-500 hover:text-stone-800 dark:hover:text-stone-200">&times;</button>
                </header>
                <div className="p-6 overflow-y-auto">
                    <LorebookEntryPreview entry={previewingEntry} />
                </div>
            </div>
        </div>
      )}

      {editingEntry && <EditorModal initialEntry={editingEntry} onSave={handleUpdateEntry} onCancel={() => setEditingEntry(null)}/>}

    </div>
  );
};

export default App;
