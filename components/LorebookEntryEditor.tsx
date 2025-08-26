
import React from 'react';
import type { LorebookEntry } from '../types';
import { TagInput } from './TagInput';

interface LorebookEntryEditorProps {
  entry: LorebookEntry;
  onChange: (field: keyof LorebookEntry, value: any) => void;
}

const inputClass = "w-full px-2 py-1 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] text-sm";
const labelClass = "block text-sm font-medium text-[var(--color-text-primary)] mb-1";

const CheckboxField: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void; }> = ({ label, checked, onChange }) => (
    <label className="flex items-center space-x-2 cursor-pointer select-none">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="form-checkbox h-4 w-4 rounded text-[var(--color-accent)] bg-[var(--color-bg-tertiary)] border-[var(--color-border)] focus:ring-[var(--color-accent)]" />
        <span className="text-sm text-[var(--color-text-primary)]">{label}</span>
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

export const LorebookEntryEditor: React.FC<LorebookEntryEditorProps> = ({ entry, onChange }) => {
  const handleCheckboxChange = (field: keyof LorebookEntry) => (checked: boolean) => {
    onChange(field, checked);
  };
  
  return (
    <div className="space-y-4 text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="md:col-span-1">
                <label className={labelClass}>Primary Keywords</label>
                <TagInput tags={entry.key} onChange={(newTags) => onChange('key', newTags)} />
            </div>
             <div className="md:col-span-1">
                <label className={labelClass}>Logic</label>
                <select value={entry.selectiveLogic} onChange={(e) => onChange('selectiveLogic', parseInt(e.target.value))} className={inputClass}>
                    <option value={0}>AND ANY</option>
                    <option value={1}>AND ALL</option>
                    <option value={2}>NOT ALL</option>
                    <option value={3}>NOT ANY</option>
                </select>
            </div>
            <div className="md:col-span-1">
                <label className={labelClass}>Optional Filter</label>
                <TagInput tags={entry.keysecondary} onChange={(newTags) => onChange('keysecondary', newTags)} />
            </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <NumberField label="Scan Depth" value={entry.scanDepth} onChange={(v) => onChange('scanDepth', v)} placeholder="Global"/>
            <TriStateSelect label="Case-Sensitive" value={entry.caseSensitive} onChange={(v) => onChange('caseSensitive', v)} />
            <TriStateSelect label="Whole Words" value={entry.matchWholeWords} onChange={(v) => onChange('matchWholeWords', v)} />
            <TriStateSelect label="Group Scoring" value={entry.useGroupScoring} onChange={(v) => onChange('useGroupScoring', v)} />
            <div>
                 <label className={labelClass}>Automation ID</label>
                 <input type="text" value={entry.automationId} onChange={e => onChange('automationId', e.target.value)} className={inputClass} />
            </div>
        </div>

        <div className="flex flex-col flex-grow">
            <label className={labelClass}>Content</label>
            <textarea
              value={entry.content}
              onChange={(e) => onChange('content', e.target.value)}
              className={`${inputClass} font-mono text-sm resize-y min-h-[150px]`}
              placeholder="Enter your lore here... Markdown is supported."
            />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2">
            <CheckboxField label="Non-recursable" checked={entry.excludeRecursion} onChange={handleCheckboxChange('excludeRecursion')} />
            <CheckboxField label="Delay until recursion" checked={entry.delayUntilRecursion} onChange={handleCheckboxChange('delayUntilRecursion')} />
            <CheckboxField label="Prevent further recursion" checked={entry.preventRecursion} onChange={handleCheckboxChange('preventRecursion')} />
            <CheckboxField label="Ignore budget" checked={entry.ignoreBudget} onChange={handleCheckboxChange('ignoreBudget')} />
        </div>

        <div className="border-t border-[var(--color-border)] pt-4">
            <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">Inclusion Group</h4>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-end">
                <div className="md:col-span-2">
                    <label className={labelClass}>Group Label</label>
                    <input type="text" value={entry.group} onChange={e => onChange('group', e.target.value)} placeholder="Only one entry with the same label will be activated" className={inputClass} />
                </div>
                <NumberField label="Group Weight" value={entry.groupWeight} onChange={v => onChange('groupWeight', v)} />
                <NumberField label="Sticky" value={entry.sticky} onChange={v => onChange('sticky', v)} />
                <NumberField label="Cooldown" value={entry.cooldown} onChange={v => onChange('cooldown', v)} />
                <NumberField label="Delay" value={entry.delay} onChange={v => onChange('delay', v)} />
                <CheckboxField label="Prioritize" checked={entry.groupOverride} onChange={handleCheckboxChange('groupOverride')} />
            </div>
        </div>

        <div className="border-t border-[var(--color-border)] pt-4">
            <label className={labelClass}>Filter to Characters or Tags</label>
            <TagInput tags={entry.triggers} onChange={(newTags) => onChange('triggers', newTags)} />
        </div>

        <div className="border-t border-[var(--color-border)] pt-4">
             <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">Additional Matching Sources</h4>
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
  );
};
