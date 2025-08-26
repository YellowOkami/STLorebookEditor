
export interface LorebookEntry {
  uid: number;
  key: string[];
  keysecondary: string[];
  comment: string;
  content: string;
  constant: boolean;
  vectorized: boolean;
  selective: boolean;
  selectiveLogic: number;
  addMemo: boolean;
  order: number;
  position: number;
  disable: boolean;
  ignoreBudget: boolean;
  excludeRecursion: boolean;
  preventRecursion: boolean;
  matchPersonaDescription: boolean;
  matchCharacterDescription: boolean;
  matchCharacterPersonality: boolean;
  matchCharacterDepthPrompt: boolean;
  matchScenario: boolean;
  matchCreatorNotes: boolean;
  delayUntilRecursion: boolean;
  probability: number;
  useProbability: boolean;
  depth: number;
  group: string;
  groupOverride: boolean;
  groupWeight: number;
  scanDepth: null | number;
  caseSensitive: null | boolean;
  matchWholeWords: null | boolean;
  useGroupScoring: null | boolean;
  automationId: string;
  role: null | string;
  sticky: number;
  cooldown: number;
  delay: number;
  triggers: any[];
  displayIndex: number;
}

export interface Lorebook {
  entries: {
    [key: string]: LorebookEntry;
  };
}
