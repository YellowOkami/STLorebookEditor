
import React from 'react';
import { useState, useEffect, useRef, useMemo } from 'react';
import type { Lorebook, LorebookEntry } from './types';
import { LorebookEntryEditor } from './components/LorebookEntryEditor';
import { LorebookEntryPreview } from './components/LorebookEntryPreview';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { UploadIcon, DownloadIcon, PlusIcon, DeleteIcon, LinkIcon, CheckIcon, DragHandleIcon, SaveIcon, CancelIcon, PreviewIcon, EditIcon, ChevronDownIcon, ChevronUpIcon, RestoreIcon, ShieldCheckIcon, CheckboxIcon, CheckboxCheckedIcon, CloseIcon } from './components/Icons';
import { TagInput } from './components/TagInput';
import { themes, type Theme } from './themes';

// Simple SVG icon components for status indicators
const GreenCircleIcon: React.FC = () => <svg viewBox="0 0 10 10" className="w-4 h-4"><circle cx="5" cy="5" r="5" fill="#4ade80" /></svg>;
const BlueCircleIcon: React.FC = () => <svg viewBox="0 0 10 10" className="w-4 h-4"><circle cx="5" cy="5" r="5" fill="#60a5fa" /></svg>;

// A reusable, styled toggle switch component
const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void; }> = ({ enabled, onChange }) => (
    <button
      onClick={(e) => { e.stopPropagation(); onChange(!enabled); }}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-bg-secondary)] focus:ring-[var(--color-accent)] ${enabled ? 'bg-[var(--color-toggle-on)]' : 'bg-[var(--color-bg-tertiary)]'}`}
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
  onToggleExpand: (uid: number) => void;
  isSelected: boolean;
  onToggleSelect: (uid: number, e: React.MouseEvent) => void;
  isSelectionMode: boolean;
  hasBackup: boolean;
  onRestore: (uid: number) => void;
}> = ({ entry, onUpdate, onEdit, onPreview, onDelete, openDropdownUid, setOpenDropdownUid, onDragStart, onDragOver, onDrop, onDragEnd, isDragging, isExpanded, onToggleExpand, isSelected, onToggleSelect, isSelectionMode, hasBackup, onRestore }) => {

  const dropdownRef = useRef<HTMLDivElement>(null);
  const isDropdownOpen = openDropdownUid === entry.uid;

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(entry.comment);

  const getStatus = () => {
    if (entry.vectorized) return { Icon: LinkIcon, tooltip: 'Vectorized', color: 'text-[var(--color-text-secondary)]' };
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
  
  const handleCardClick = (e: React.MouseEvent) => {
    if (isSelectionMode || e.ctrlKey || e.metaKey) {
        onToggleSelect(entry.uid, e);
    } else {
        onToggleExpand(entry.uid);
    }
  };

  const { Icon, tooltip, color } = getStatus();
  
  const buttonClass = "p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors rounded-full hover:bg-[var(--color-bg-tertiary)]";

  return (
    <div 
        className={`bg-[var(--color-bg-secondary)] rounded-lg border transition-all duration-300 ${entry.disable ? 'opacity-50 grayscale-[50%]' : ''} ${isDragging ? 'opacity-30' : 'opacity-100'} ${isSelected ? 'ring-2 ring-[var(--color-accent)] border-transparent' : 'border-[var(--color-border)]'}`}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
    >
        <div className="flex justify-between items-start p-3 cursor-pointer" onClick={handleCardClick}>
            <div className="flex items-start gap-3 flex-grow min-w-0">
                {isSelectionMode ? (
                    <div onClick={(e) => onToggleSelect(entry.uid, e)} className="flex-shrink-0 pt-1 text-[var(--color-accent)]">
                        {isSelected ? <CheckboxCheckedIcon /> : <CheckboxIcon className="text-[var(--color-text-secondary)]" />}
                    </div>
                ) : (
                    <div onDragStart={onDragStart} draggable="true" className="cursor-move text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex-shrink-0 pt-1" onClick={e => e.stopPropagation()}>
                        <DragHandleIcon />
                    </div>
                )}
                <div className="min-w-0 flex-grow pt-1">
                    {isEditingTitle ? (
                         <input
                            type="text"
                            value={titleValue}
                            onChange={(e) => setTitleValue(e.target.value)}
                            onBlur={handleTitleSave}
                            onKeyDown={handleTitleKeyDown}
                            className="text-lg font-bold bg-transparent border-b-2 border-[var(--color-text-secondary)] focus:border-[var(--color-accent)] outline-none w-full text-[var(--color-text-primary)]"
                            autoFocus
                            onClick={e => e.stopPropagation()}
                        />
                    ) : (
                        <h3 onClick={(e) => { e.stopPropagation(); setIsEditingTitle(true); }} className="text-lg font-bold text-[var(--color-text-primary)] truncate inline-block cursor-text p-1 -m-1 rounded hover:bg-[var(--color-bg-tertiary)]">{entry.comment || "Untitled Entry"}</h3>
                    )}
                     <div className={`flex flex-wrap gap-2 transition-all duration-300 ${isExpanded && entry.key.length > 0 ? 'mt-2' : 'mt-0'}`}>
                        {entry.key.slice(0, isExpanded ? entry.key.length : 0).map((tag, index) => (
                           <span key={index} className="bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] text-xs font-medium px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex-shrink-0 flex items-center gap-1 ml-4" onClick={e => e.stopPropagation()}>
                <ToggleSwitch enabled={!entry.disable} onChange={handleToggleDisable} />
                <div className="relative" ref={dropdownRef}>
                    <button onClick={handleDropdownToggle} className={`relative flex items-center justify-center p-2 group rounded-full hover:bg-[var(--color-bg-tertiary)] ${color}`} title={tooltip}>
                        <Icon />
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md shadow-lg z-10">
                            <div className="py-1">
                                <button onClick={() => handleActivationChange({ constant: false, vectorized: false })} className="flex justify-between items-center w-full px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]">
                                    <div className="flex items-center gap-2"><GreenCircleIcon /> Keyword Triggered</div>
                                    {!entry.constant && !entry.vectorized && <CheckIcon />}
                                </button>
                                <button onClick={() => handleActivationChange({ constant: true, vectorized: false })} className="flex justify-between items-center w-full px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]">
                                    <div className="flex items-center gap-2"><BlueCircleIcon /> Constant</div>
                                    {entry.constant && <CheckIcon />}
                                </button>
                                <button onClick={() => handleActivationChange({ constant: false, vectorized: true })} className="flex justify-between items-center w-full px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]">
                                    <div className="flex items-center gap-2"><LinkIcon /> Vectorized</div>
                                    {entry.vectorized && <CheckIcon />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="w-px h-6 bg-[var(--color-border)] mx-1"></div>
                 {hasBackup && (
                    <button onClick={(e) => { e.stopPropagation(); onRestore(entry.uid); }} className={`${buttonClass} hover:text-[var(--color-accent)]`} aria-label={`Restore ${entry.comment}`} title="Restore to last saved state">
                        <RestoreIcon />
                    </button>
                )}
                 <button onClick={(e) => { e.stopPropagation(); onPreview(entry); }} className={buttonClass} aria-label={`Preview ${entry.comment}`} title="Preview"><PreviewIcon /></button>
                 <button onClick={(e) => { e.stopPropagation(); onEdit(entry); }} className={buttonClass} aria-label={`Edit ${entry.comment}`}><EditIcon /></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(entry.uid); }} className={`${buttonClass} hover:text-[var(--color-danger)]`} aria-label={`Delete ${entry.comment}`}>
                    <DeleteIcon />
                </button>
                 <div className="text-[var(--color-text-secondary)] ml-2">
                    {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </div>
            </div>
        </div>
        {isExpanded && (
             <div className="p-4 pt-2 border-t border-[var(--color-border)]">
                <div className="max-w-none p-4 bg-[var(--color-bg-primary)] rounded-lg border border-[var(--color-border)] text-sm">
                   <MarkdownRenderer text={entry.content} />
                </div>
            </div>
        )}
    </div>
  );
};

// Reusable form control components and styles for the new editor modal
const inputClass = "w-full px-2 py-1 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] text-sm";
const labelClass = "block text-sm font-medium text-[var(--color-text-primary)] mb-1";

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

    const handleSave = () => {
        onSave(entry);
    };

    const handleCancelWithConfirm = () => {
        const hasChanges = JSON.stringify(initialEntry) !== JSON.stringify(entry);
        if (hasChanges) {
            if (window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
                onCancel();
            }
        } else {
            onCancel();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 overflow-y-auto" onClick={handleCancelWithConfirm}>
            <div className="bg-[var(--color-bg-secondary)] rounded-lg shadow-2xl w-full max-w-5xl h-5/6 flex flex-col border border-[var(--color-border)]" onClick={e => e.stopPropagation()}>
                <main className="p-6 space-y-6 flex-grow flex flex-col min-h-0 text-[var(--color-text-primary)]">
                    <div>
                        <label htmlFor="edit-title" className={labelClass}>Title</label>
                        <input id="edit-title" type="text" value={entry.comment} onChange={e => handleChange('comment', e.target.value)} className={inputClass} />
                    </div>
                    
                    <div className="flex flex-col flex-grow min-h-0">
                        <label htmlFor="edit-content" className={labelClass}>Content</label>
                        <textarea id="edit-content" value={entry.content} onChange={e => handleChange('content', e.target.value)} className={`${inputClass} font-mono text-sm resize-y flex-grow`} placeholder="Enter your lore here... Markdown is supported."/>
                    </div>
                    
                    <div className="border-t border-[var(--color-border)]">
                        <button onClick={() => setAdvancedSettingsOpen(!advancedSettingsOpen)} className="flex justify-between items-center w-full text-left py-3 font-semibold text-lg">
                            <span>Keywords & Advanced Settings</span>
                            {advancedSettingsOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                        </button>
                        {advancedSettingsOpen && (
                            <div className="pt-4">
                               <LorebookEntryEditor entry={entry} onChange={handleChange} />
                            </div>
                        )}
                    </div>
                </main>
                <footer className="flex justify-end items-center gap-3 p-4 border-t border-[var(--color-border)] flex-shrink-0">
                    <button onClick={handleCancelWithConfirm} className="flex items-center gap-2 bg-[var(--color-interactive)] text-[var(--color-interactive-text)] font-semibold py-2 px-4 rounded-lg hover:bg-[var(--color-interactive-hover)] transition-colors">
                        <CancelIcon /> Cancel
                    </button>
                    <button onClick={handleSave} className="flex items-center gap-2 bg-[var(--color-accent)] text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity">
                        <SaveIcon /> Save
                    </button>
                </footer>
            </div>
        </div>
    );
};

const ValidatorModal: React.FC<{ issues: string[], onClose: () => void }> = ({ issues, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
        <div className="bg-[var(--color-bg-secondary)] rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-[var(--color-border)]" onClick={e => e.stopPropagation()}>
            <header className="flex justify-between items-center p-4 border-b border-[var(--color-border)] flex-shrink-0">
                <h2 className="text-xl font-bold">Lorebook Validation Report</h2>
                <button onClick={onClose} className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-full"><CloseIcon /></button>
            </header>
            <main className="p-6 overflow-y-auto text-[var(--color-text-primary)]">
                {issues.length > 0 ? (
                    <ul className="list-disc list-inside space-y-2">
                        {issues.map((issue, index) => <li key={index}>{issue}</li>)}
                    </ul>
                ) : (
                    <p>No issues found. Your lorebook looks clean!</p>
                )}
            </main>
        </div>
    </div>
);


const FeaturesModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
        <div className="bg-[var(--color-bg-secondary)] rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <header className="flex justify-between items-center p-4 border-b border-[var(--color-border)] flex-shrink-0">
                <h2 className="text-xl font-bold">App Features</h2>
                <button onClick={onClose} className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-full"><CloseIcon /></button>
            </header>
            <main className="p-6 overflow-y-auto text-[var(--color-text-primary)]">
                <ul className="list-disc list-inside space-y-3">
                    <li><strong>Full Lorebook Management</strong>: Import, edit, and export <code>lorebook.json</code> files for SillyTavern.</li>
                    <li><strong>Advanced Search</strong>: Instantly filter entries by title, tags, or content using the search bar in the header.</li>
                    <li><strong>Bulk Editing</strong>: Enter "Select" mode or use <code>Ctrl/Cmd + Click</code> to select multiple entries. Enable, disable, or delete them all at once.</li>
                    <li><strong>Lorebook Validator</strong>: Scan your lorebook for common issues like disabled entries or keyword entries without any keywords.</li>
                    <li><strong>Drag-and-Drop Reordering</strong>: Easily change the order of your lorebook entries.</li>
                    <li><strong>Comprehensive Editor</strong>: A powerful pop-up editor provides access to all lorebook entry fields, including advanced settings.</li>
                    <li><strong>Quick Previews</strong>: Collapse entries to see a clean list, and expand them to see their content without opening the full editor.</li>
                    <li><strong>Safe Editing</strong>: Unsaved changes are automatically backed up locally. A restore button lets you revert to the last saved state for any modified entry.</li>
                    <li><strong>Theme Customization</strong>: Choose from several built-in themes or create up to 3 of your own persistent themes in the Settings menu.</li>
                </ul>
            </main>
        </div>
    </div>
);

const MainMenu: React.FC<{
    onNavigate: (view: 'editor' | 'settings') => void;
    onImport: () => void;
    onCreate: () => void;
    lorebookExists: boolean;
}> = ({ onNavigate, onImport, onCreate, lorebookExists }) => {
    const [showFeatures, setShowFeatures] = useState(false);
    
    return (
        <div className="flex-grow flex flex-col justify-center items-center p-4 relative">
             <div className="text-center bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)] shadow-sm p-8 md:p-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">SillyTavern Lorebook Editor</h1>
                <p className="text-[var(--color-text-secondary)] mb-8 max-w-xl">A powerful, local web application to import, edit, and export your SillyTavern lorebook JSON files.</p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    {lorebookExists && (
                         <button onClick={() => onNavigate('editor')} className="bg-[var(--color-accent)] text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:opacity-90 transition-transform transform hover:scale-105 w-full sm:w-auto">
                            Continue Editing
                        </button>
                    )}
                    <button onClick={onCreate} className="bg-[var(--color-interactive)] text-[var(--color-interactive-text)] font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-[var(--color-interactive-hover)] transition-transform transform hover:scale-105 w-full sm:w-auto">
                        Create New Lorebook
                    </button>
                    <button onClick={onImport} className="bg-[var(--color-interactive)] text-[var(--color-interactive-text)] font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-[var(--color-interactive-hover)] transition-transform transform hover:scale-105 w-full sm:w-auto">
                        Import Lorebook
                    </button>
                </div>
                 <div className="mt-8 space-x-6">
                    <button onClick={() => setShowFeatures(true)} className="text-sm text-[var(--color-text-secondary)] hover:underline">
                        App Features
                    </button>
                    <button onClick={() => onNavigate('settings')} className="text-sm text-[var(--color-text-secondary)] hover:underline">
                        Settings
                    </button>
                </div>
            </div>
             {showFeatures && <FeaturesModal onClose={() => setShowFeatures(false)} />}
             <footer className="absolute bottom-4 text-xs text-[var(--color-text-secondary)]">
                Made by YellowOkami.
            </footer>
        </div>
    );
};

const SettingsMenu: React.FC<{
    onNavigate: (view: 'main') => void;
    currentTheme: Theme;
    onThemeChange: (theme: Theme) => void;
    customThemes: Theme[];
    onCustomThemesChange: (customThemes: Theme[]) => void;
    editingCustomThemeIndex: number;
    setEditingCustomThemeIndex: (index: number) => void;
}> = ({ onNavigate, currentTheme, onThemeChange, customThemes, onCustomThemesChange, editingCustomThemeIndex, setEditingCustomThemeIndex }) => {

    const handleColorChange = (key: keyof Theme['colors'], value: string) => {
        const newCustomThemes = [...customThemes];
        const themeToEdit = { ...newCustomThemes[editingCustomThemeIndex] };
        
        themeToEdit.colors = {
            ...themeToEdit.colors,
            [key]: value,
        };
        newCustomThemes[editingCustomThemeIndex] = themeToEdit;
        onCustomThemesChange(newCustomThemes);
    };
    
    // Helper to convert HSL string to HEX for color input
    const hslToHex = (hsl: string): string => {
        const match = /hsl\((\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\)/.exec(hsl);
        if (!match) return '#000000';
        let [h, s, l] = [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
        s /= 100;
        l /= 100;
        const c = (1 - Math.abs(2 * l - 1)) * s,
              x = c * (1 - Math.abs((h / 60) % 2 - 1)),
              m = l - c/2;
        let r = 0, g = 0, b = 0;
        if (0 <= h && h < 60) { [r, g, b] = [c, x, 0]; }
        else if (60 <= h && h < 120) { [r, g, b] = [x, c, 0]; }
        else if (120 <= h && h < 180) { [r, g, b] = [0, c, x]; }
        else if (180 <= h && h < 240) { [r, g, b] = [0, x, c]; }
        else if (240 <= h && h < 300) { [r, g, b] = [x, 0, c]; }
        else if (300 <= h && h < 360) { [r, g, b] = [c, 0, x]; }
        
        const toHex = (n: number) => {
            const hex = Math.round(n * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };

        return `#${toHex(r + m)}${toHex(g + m)}${toHex(b + m)}`;
    }

    // Helper to convert HEX to HSL string
    const hexToHsl = (hex: string): string => {
        let r = 0, g = 0, b = 0;
        if (hex.length == 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length == 7) {
            r = parseInt(hex.substring(1, 3), 16);
            g = parseInt(hex.substring(3, 5), 16);
            b = parseInt(hex.substring(5, 7), 16);
        }
        r /= 255; g /= 255; b /= 255;
        let cmin = Math.min(r,g,b),
            cmax = Math.max(r,g,b),
            delta = cmax - cmin,
            h = 0, s = 0, l = 0;
        if (delta == 0) h = 0;
        else if (cmax == r) h = ((g - b) / delta) % 6;
        else if (cmax == g) h = (b - r) / delta + 2;
        else h = (r - g) / delta + 4;
        h = Math.round(h * 60);
        if (h < 0) h += 360;
        l = (cmax + cmin) / 2;
        s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
        s = +(s * 100).toFixed(1);
        l = +(l * 100).toFixed(1);
        return "hsl(" + h + ", " + s + "%, " + l + "%)";
    }

    const currentCustomTheme = customThemes[editingCustomThemeIndex] || themes[0];

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 w-full">
            <header className="mb-6">
                <button onClick={() => onNavigate('main')} className="text-sm text-[var(--color-text-secondary)] hover:underline mb-2">&larr; Back to Main Menu</button>
                <h1 className="text-3xl font-bold">Settings</h1>
            </header>
            <div className="bg-[var(--color-bg-secondary)] p-6 rounded-lg border border-[var(--color-border)] space-y-8">
                <div>
                    <h2 className="text-xl font-semibold mb-4">Color Theme</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {themes.map(theme => (
                            <button key={theme.name} onClick={() => onThemeChange(theme)} className={`p-4 rounded-lg border-2 transition-colors ${currentTheme.name === theme.name ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)]'}`}>
                                <div className="flex justify-between mb-2">
                                    <div className="w-5 h-5 rounded-full" style={{backgroundColor: theme.colors['--color-bg-primary']}}></div>
                                    <div className="w-5 h-5 rounded-full" style={{backgroundColor: theme.colors['--color-interactive']}}></div>
                                    <div className="w-5 h-5 rounded-full" style={{backgroundColor: theme.colors['--color-accent']}}></div>
                                </div>
                                <span className="font-semibold text-[var(--color-text-primary)]">{theme.name}</span>
                            </button>
                        ))}
                         {customThemes.map((theme, index) => (
                            <button key={index} onClick={() => onThemeChange(theme)} className={`p-4 rounded-lg border-2 transition-colors ${currentTheme.name === theme.name ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)]'}`}>
                                <div className="flex justify-between mb-2">
                                    <div className="w-5 h-5 rounded-full" style={{backgroundColor: theme.colors['--color-bg-primary']}}></div>
                                    <div className="w-5 h-5 rounded-full" style={{backgroundColor: theme.colors['--color-interactive']}}></div>
                                    <div className="w-5 h-5 rounded-full" style={{backgroundColor: theme.colors['--color-accent']}}></div>
                                </div>
                                <span className="font-semibold text-[var(--color-text-primary)]">{theme.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                 <div>
                    <div className="flex items-center gap-4 mb-4">
                         <h2 className="text-xl font-semibold">Custom Theme Editor</h2>
                         <select value={editingCustomThemeIndex} onChange={e => setEditingCustomThemeIndex(Number(e.target.value))} className={`${inputClass} !w-auto`}>
                            <option value={0}>Custom 1</option>
                            <option value={1}>Custom 2</option>
                            <option value={2}>Custom 3</option>
                         </select>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                        {Object.entries(currentCustomTheme.colors).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between">
                                <label className="text-sm capitalize">{key.replace('--color-', '').replace(/-/g, ' ')}</label>
                                <input 
                                    type="color" 
                                    value={hslToHex(value)}
                                    onChange={(e) => handleColorChange(key as keyof Theme['colors'], hexToHsl(e.target.value))}
                                    className="w-10 h-10 p-1 bg-transparent border-none rounded-md cursor-pointer"
                                />
                            </div>
                        ))}
                    </div>
                 </div>
            </div>
        </div>
    );
};


const App: React.FC = () => {
  const [view, setView] = useState<'main' | 'editor' | 'settings'>('main');
  const [lorebook, setLorebook] = useState<Lorebook | null>(null);
  const [lorebookName, setLorebookName] = useState<string>('lorebook');
  const [editingEntry, setEditingEntry] = useState<LorebookEntry | null>(null);
  const [previewingEntry, setPreviewingEntry] = useState<LorebookEntry | null>(null);
  const [openDropdownUid, setOpenDropdownUid] = useState<number | null>(null);
  const [expandedUid, setExpandedUid] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draggedUid, setDraggedUid] = useState<number | null>(null);
  const [backups, setBackups] = useState<Record<number, LorebookEntry>>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedUids, setSelectedUids] = useState<Set<number>>(new Set());
  const [showValidatorModal, setShowValidatorModal] = useState(false);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);
  const [customThemes, setCustomThemes] = useState<Theme[]>(() => {
    try {
        const saved = localStorage.getItem('customThemes');
        return saved ? JSON.parse(saved) : [
            { name: 'Custom 1', mode: 'dark', colors: { ...themes[0].colors } },
            { name: 'Custom 2', mode: 'dark', colors: { ...themes[0].colors } },
            { name: 'Custom 3', mode: 'dark', colors: { ...themes[0].colors } },
        ];
    } catch {
        return [
            { name: 'Custom 1', mode: 'dark', colors: { ...themes[0].colors } },
            { name: 'Custom 2', mode: 'dark', colors: { ...themes[0].colors } },
            { name: 'Custom 3', mode: 'dark', colors: { ...themes[0].colors } },
        ];
    }
  });
  const [editingCustomThemeIndex, setEditingCustomThemeIndex] = useState(0);

  // Theme initialization effect
  useEffect(() => {
    const savedThemeName = localStorage.getItem('themeName');
    const allThemes = [...themes, ...customThemes];
    const theme = allThemes.find(t => t.name === savedThemeName) || themes[0];
    setCurrentTheme(theme);
  }, []); // customThemes is initialized from state, so it's safe to not include it here.

  // Theme application and saving effect
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    if (currentTheme.mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem('themeName', currentTheme.name);
    try {
        localStorage.setItem('customThemes', JSON.stringify(customThemes));
    } catch (e) {
        console.error("Failed to save custom themes to localStorage", e);
    }
  }, [currentTheme, customThemes]);

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
  };

  const handleCustomThemesChange = (newCustomThemes: Theme[]) => {
    setCustomThemes(newCustomThemes);
    const activeCustomTheme = newCustomThemes.find(t => t.name === currentTheme.name);
    if (activeCustomTheme) {
        setCurrentTheme(activeCustomTheme);
    }
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
          setBackups({});
          setSelectedUids(new Set());
          setIsSelectionMode(false);
          setView('editor');
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
    event.target.value = ''; // Reset file input
  };
  
  const handleCreateLorebook = () => {
    setLorebook({ entries: {} });
    setLorebookName('new-lorebook');
    setError(null);
    setEditingEntry(null);
    setPreviewingEntry(null);
    setOpenDropdownUid(null);
    setExpandedUid(null);
    setBackups({});
    setSelectedUids(new Set());
    setIsSelectionMode(false);
    setView('editor');
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

    const originalEntry = Object.values(lorebook.entries).find(e => e.uid === updatedEntry.uid);
    if (originalEntry && !backups[updatedEntry.uid] && JSON.stringify(originalEntry) !== JSON.stringify(updatedEntry)) {
        setBackups(prev => ({ ...prev, [updatedEntry.uid]: originalEntry }));
    }

    setLorebook(prev => {
      if (!prev) return null;
      const newEntries = { ...prev.entries };
      const keyToUpdate = Object.keys(newEntries).find(k => newEntries[k].uid === updatedEntry.uid);
      if (keyToUpdate) {
          newEntries[keyToUpdate] = updatedEntry;
      }
      return { ...prev, entries: newEntries };
    });
  };
  
  const handleSaveFromEditor = (entry: LorebookEntry) => {
    handleUpdateEntry(entry);
    setEditingEntry(null);
    setBackups(prev => {
        const newBackups = {...prev};
        delete newBackups[entry.uid];
        return newBackups;
    });
  };


  const handleDeleteEntry = (uid: number) => {
    if (!lorebook) return;
    if (!window.confirm(`Are you sure you want to delete this entry?`)) return;
    setLorebook(prev => {
      if (!prev) return null;
      const newEntries = { ...prev.entries };
      const keyToDelete = Object.keys(newEntries).find(k => newEntries[k].uid === uid);
      if (keyToDelete) {
        delete newEntries[keyToDelete];
      }
      return { ...prev, entries: newEntries };
    });
    setBackups(prev => {
        const newBackups = {...prev};
        delete newBackups[uid];
        return newBackups;
    });
    setSelectedUids(prev => {
        const newSelection = new Set(prev);
        newSelection.delete(uid);
        return newSelection;
    });
  };

  const handleAddEntry = () => {
    if (!lorebook) return;
    const existingUids = Object.values(lorebook.entries).map(e => e.uid);
    const maxUid = existingUids.length > 0 ? Math.max(...existingUids) : -1;
    const newUid = maxUid + 1;
    const newDisplayIndex = lorebook ? Object.keys(lorebook.entries).length : 0;

    const newEntry: LorebookEntry = {
        uid: newUid, key: [], comment: "New Entry", content: "Content for the new entry.", displayIndex: newDisplayIndex,
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
  
  const handleOpenEditor = (entry: LorebookEntry) => {
      if (!backups[entry.uid]) {
          setBackups(prev => ({...prev, [entry.uid]: entry}));
      }
      setEditingEntry(entry);
  };

  const handleRestoreEntry = (uid: number) => {
      if (!lorebook || !backups[uid]) return;
      
      if (window.confirm('Are you sure you want to restore this entry to its last saved state? All current changes will be lost.')) {
          const backupEntry = backups[uid];
           setLorebook(prev => {
              if (!prev) return null;
              const newEntries = { ...prev.entries };
              const keyToUpdate = Object.keys(newEntries).find(k => newEntries[k].uid === backupEntry.uid);
              if (keyToUpdate) {
                  newEntries[keyToUpdate] = backupEntry;
              }
              return { ...prev, entries: newEntries };
            });
          setBackups(prev => {
              const newBackups = {...prev};
              delete newBackups[uid];
              return newBackups;
          });
      }
  };

  const handleDragStart = (e: React.DragEvent, uid: number) => setDraggedUid(uid);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDragEnd = () => setDraggedUid(null);
  
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

  const handleToggleSelect = (uid: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUids(prev => {
        const newSelection = new Set(prev);
        if (newSelection.has(uid)) {
            newSelection.delete(uid);
        } else {
            newSelection.add(uid);
        }
        return newSelection;
    });
  };

  const handleToggleSelectAll = () => {
      if (selectedUids.size === (lorebook ? Object.keys(lorebook.entries).length : 0)) {
          setSelectedUids(new Set());
      } else {
          const allUids = lorebook ? Object.values(lorebook.entries).map(e => e.uid) : [];
          setSelectedUids(new Set(allUids));
      }
  };

  const handleBulkAction = (action: 'enable' | 'disable' | 'delete') => {
      if (!lorebook) return;
      if (action === 'delete') {
          if (!window.confirm(`Are you sure you want to delete ${selectedUids.size} entries?`)) return;
      }

      setLorebook(prev => {
          if (!prev) return null;
          const newEntries = { ...prev.entries };
          selectedUids.forEach(uid => {
              const keyToModify = Object.keys(newEntries).find(k => newEntries[k].uid === uid);
              if (keyToModify) {
                  if (action === 'enable') newEntries[keyToModify].disable = false;
                  else if (action === 'disable') newEntries[keyToModify].disable = true;
                  else if (action === 'delete') delete newEntries[keyToModify];
              }
          });
          return { ...prev, entries: newEntries };
      });
      setSelectedUids(new Set());
      setIsSelectionMode(false);
  };

  const handleValidate = () => {
      if (!lorebook) return;
      const issues: string[] = [];
      Object.values(lorebook.entries).forEach(entry => {
          if (entry.disable) {
              issues.push(`Entry "${entry.comment}" is disabled.`);
          }
          if (!entry.constant && !entry.vectorized && entry.key.length === 0) {
              issues.push(`Entry "${entry.comment}" is keyword-triggered but has no keywords.`);
          }
      });
      setValidationIssues(issues);
      setShowValidatorModal(true);
  };

  const filteredAndSortedEntries = useMemo(() => {
    if (!lorebook) return [];
    
    let entries = Object.values(lorebook.entries).sort((a, b) => a.displayIndex - b.displayIndex);
    
    if (searchQuery.trim()) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        entries = entries.filter(entry => 
            entry.comment.toLowerCase().includes(lowerCaseQuery) ||
            entry.content.toLowerCase().includes(lowerCaseQuery) ||
            entry.key.some(tag => tag.toLowerCase().includes(lowerCaseQuery))
        );
    }
    
    return entries;
  }, [lorebook, searchQuery]);
  
  const renderEditor = () => (
    <>
      <header className="sticky top-0 z-20 bg-[var(--color-bg-primary)]/80 backdrop-blur-sm border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center flex-wrap gap-y-2 gap-x-4">
            <div className="flex items-center gap-4 flex-shrink-0">
                <h1 className="text-xl font-bold text-[var(--color-text-primary)]">SillyTavern Lorebook Editor</h1>
            </div>
            <div className="flex-grow flex justify-center min-w-[200px]">
                <input
                    type="search"
                    placeholder="Search entries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-lg px-3 py-1.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] text-sm"
                />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={handleValidate} className="flex items-center gap-2 bg-[var(--color-interactive)] text-[var(--color-interactive-text)] font-semibold py-2 px-3 rounded-lg hover:bg-[var(--color-interactive-hover)] transition-colors text-sm" title="Validate Lorebook"><ShieldCheckIcon /></button>
                <button onClick={() => setIsSelectionMode(!isSelectionMode)} className={`flex items-center gap-2 font-semibold py-2 px-3 rounded-lg transition-colors text-sm ${isSelectionMode ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-interactive)] text-[var(--color-interactive-text)] hover:bg-[var(--color-interactive-hover)]'}`}>{isSelectionMode ? 'Cancel' : 'Select'}</button>
                <div className="w-px h-6 bg-[var(--color-border)] mx-1"></div>
                <button onClick={() => setView('main')} className="bg-[var(--color-interactive)] text-[var(--color-interactive-text)] font-semibold py-2 px-3 rounded-lg hover:bg-[var(--color-interactive-hover)] transition-colors text-sm">Main Menu</button>
                <button onClick={handleImportClick} className="bg-[var(--color-interactive)] text-[var(--color-interactive-text)] font-semibold py-2 px-3 rounded-lg hover:bg-[var(--color-interactive-hover)] transition-colors text-sm"><UploadIcon /></button>
                <button onClick={handleExportClick} disabled={!lorebook} className="bg-[var(--color-interactive)] text-[var(--color-interactive-text)] font-semibold py-2 px-3 rounded-lg hover:bg-[var(--color-interactive-hover)] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"><DownloadIcon /></button>
            </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6 flex-grow w-full">
            <div className="flex justify-between items-center mb-4 gap-4">
                 <div className="flex items-center gap-2">
                    <label htmlFor="lorebookName" className="font-semibold text-sm text-[var(--color-text-secondary)]">Book Name:</label>
                    <input
                        id="lorebookName"
                        type="text"
                        value={lorebookName}
                        onChange={(e) => setLorebookName(e.target.value)}
                        className="w-full sm:w-auto px-3 py-1 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] text-sm"
                    />
                </div>
                 <button onClick={handleAddEntry} className="flex items-center gap-2 bg-[var(--color-accent)] text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:opacity-90 transition-opacity">
                    <PlusIcon /> Add Entry
                </button>
            </div>

            {selectedUids.size > 0 && (
                <div className="sticky top-[61px] z-10 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg p-2 mb-4 flex justify-between items-center shadow-lg">
                    <span className="text-sm font-medium px-2">{selectedUids.size} entries selected</span>
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleBulkAction('enable')} className="bg-[var(--color-interactive)] text-[var(--color-interactive-text)] text-xs font-bold py-1 px-3 rounded">ENABLE</button>
                        <button onClick={() => handleBulkAction('disable')} className="bg-[var(--color-interactive)] text-[var(--color-interactive-text)] text-xs font-bold py-1 px-3 rounded">DISABLE</button>
                        <button onClick={() => handleBulkAction('delete')} className="bg-[var(--color-danger)] text-white text-xs font-bold py-1 px-3 rounded">DELETE</button>
                        <button onClick={() => setSelectedUids(new Set())} className="text-xs font-bold py-1 px-3">DESELECT ALL</button>
                    </div>
                </div>
            )}
            
            <div className="space-y-2">
              {filteredAndSortedEntries.map((entry) => (
                <LorebookEntryCard
                  key={entry.uid}
                  entry={entry}
                  onUpdate={handleUpdateEntry}
                  onEdit={handleOpenEditor}
                  onPreview={setPreviewingEntry}
                  onDelete={handleDeleteEntry}
                  openDropdownUid={openDropdownUid}
                  setOpenDropdownUid={setOpenDropdownUid}
                  onDragStart={(e) => handleDragStart(e, entry.uid)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, entry.uid)}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedUid === entry.uid}
                  isExpanded={expandedUid === entry.uid}
                  onToggleExpand={(uid) => setExpandedUid(prev => (prev === uid ? null : uid))}
                  isSelected={selectedUids.has(entry.uid)}
                  onToggleSelect={handleToggleSelect}
                  isSelectionMode={isSelectionMode}
                  hasBackup={!!backups[entry.uid]}
                  onRestore={handleRestoreEntry}
                />
              ))}
            </div>
      </main>
    </>
  );

  return (
    <div className="min-h-screen font-sans flex flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] transition-colors duration-300">
      <input type="file" accept=".json" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
      
      {view === 'main' && <MainMenu onNavigate={setView} onImport={handleImportClick} onCreate={handleCreateLorebook} lorebookExists={!!lorebook} />}
      {view === 'editor' && renderEditor()}
      {view === 'settings' && <SettingsMenu onNavigate={setView} currentTheme={currentTheme} onThemeChange={handleThemeChange} customThemes={customThemes} onCustomThemesChange={handleCustomThemesChange} editingCustomThemeIndex={editingCustomThemeIndex} setEditingCustomThemeIndex={setEditingCustomThemeIndex} />}

      {previewingEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4" onClick={() => setPreviewingEntry(null)}>
            <div className="bg-[var(--color-bg-secondary)] rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-[var(--color-border)] flex-shrink-0">
                    <h2 className="text-xl font-bold">Preview Entry</h2>
                    <button onClick={() => setPreviewingEntry(null)} className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-full"><CloseIcon /></button>
                </header>
                <div className="p-6 overflow-y-auto">
                    <LorebookEntryPreview entry={previewingEntry} />
                </div>
            </div>
        </div>
      )}

      {editingEntry && <EditorModal initialEntry={editingEntry} onSave={handleSaveFromEditor} onCancel={() => setEditingEntry(null)}/>}
      
      {showValidatorModal && <ValidatorModal issues={validationIssues} onClose={() => setShowValidatorModal(false)} />}
    </div>
  );
};

export default App;
