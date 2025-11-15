// Core data types based on your UUID architecture

export interface Verse {
  uid: string; // Format: VR-KJV-010101-AA
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
}

export interface Person {
  uid: string; // Format: PER-000001
  name: string;
  description?: string;
  references?: string[];
}

export interface Place {
  uid: string; // Format: PLC-000045
  name: string;
  description?: string;
  references?: string[];
}

export interface Topic {
  uid: string; // Format: TOP-000101
  name: string;
  description?: string;
  references?: string[];
}

export interface Event {
  uid: string; // Format: EVT-000001
  name: string;
  description?: string;
  references?: string[];
}

export interface LexiconEntry {
  uid: string; // Format: LEX-000001
  word: string;
  original: string;
  transliteration?: string;
  definition: string;
  strongsNumber?: string;
}

export interface Commentary {
  uid: string;
  verse_uid: string;
  author: string;
  text: string;
  source?: string;
}

export interface VerseLink {
  verse_uid: string;
  entity_uid: string;
  entity_type: 'person' | 'place' | 'topic' | 'event' | 'lexicon';
}

export interface AudioMapping {
  verse_uid: string;
  file_path: string;
  narrator?: string;
}

// Plugin Settings
export interface BibleAppSettings {
  // Database
  dbType: 'postgresql' | 'sqlite';
  pgHost: string;
  pgPort: number;
  pgDatabase: string;
  pgUser: string;
  pgPassword: string;
  sqlitePath: string;

  // Display
  defaultTranslation: string;
  colorScheme: ColorScheme;
  showLineNumbers: boolean;

  // Panels
  leftPanel: PanelConfig;
  rightPanel: PanelConfig;

  // AI
  aiProvider: 'openai' | 'anthropic';
  openaiApiKey: string;
  anthropicApiKey: string;
  aiModel: string;
  contextVerses: number;

  // Audio
  audioBasePath: string;
  autoPlayAudio: boolean;
}

export interface ColorScheme {
  people: string;      // Blue
  places: string;      // Green
  topics: string;      // Purple
  events: string;      // Orange
  lexicon: string;     // Gold
}

export interface PanelConfig {
  enabled: boolean;
  type: 'commentary' | 'lexicon' | 'topics' | 'cross-refs' | 'ai' | 'notes';
  width: number;
}

// View modes
export type ViewMode = 'plain' | 'study' | 'ai';
