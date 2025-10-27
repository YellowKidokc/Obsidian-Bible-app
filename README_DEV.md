# Bible Study App - Developer Documentation

## Overview

This is a comprehensive Bible study application built as an Obsidian plugin. It integrates SQL databases (PostgreSQL/SQLite) with a UUID-based verse architecture, enabling intelligent cross-references, AI-powered study assistance, and seamless note-taking.

## Core Architecture

### Data Foundation

**Database Support:**
- **PostgreSQL** - Primary database for master data (recommended for shared/cloud deployments)
- **SQLite** - Local database option (recommended for personal/offline use)

**UID System:**
All entities use stable, human-readable UIDs:
- Verses: `VR-KJV-010101-AA` (translation-book-chapter-verse-suffix)
- People: `PER-000001`
- Places: `PLC-000045`
- Topics: `TOP-000101`
- Events: `EVT-000001`
- Lexicon: `LEX-000001`

### Project Structure

```
Obsidian-Bible-app/
├── src/
│   ├── db/                    # Database adapters
│   │   ├── database.ts        # Abstract base class
│   │   ├── postgres-adapter.ts
│   │   └── sqlite-adapter.ts
│   ├── components/            # UI components
│   │   └── bible-view.ts      # Main 3-panel view
│   ├── ai/                    # AI integration
│   │   └── ai-service.ts      # OpenAI/Anthropic wrapper
│   ├── utils/                 # Utilities
│   │   ├── uid-parser.ts      # UID validation/parsing
│   │   └── verse-note-generator.ts
│   ├── styles/                # Styling
│   │   ├── styles.css
│   │   └── color-scheme.json
│   ├── types.ts               # TypeScript interfaces
│   └── settings.ts            # Plugin settings UI
├── public/
│   └── audio/                 # Verse narration audio files
├── commentaries/              # Commentary data
├── obsidian-vault/            # Obsidian sync directory
├── main.ts                    # Plugin entry point
├── manifest.json              # Obsidian plugin manifest
├── package.json
├── tsconfig.json
└── esbuild.config.mjs
```

## Database Schema

### Core Tables

#### verses
```sql
CREATE TABLE verses (
  uid VARCHAR(20) PRIMARY KEY,  -- VR-KJV-010101-AA
  book VARCHAR(50) NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT NOT NULL,
  translation VARCHAR(10) DEFAULT 'KJV',
  INDEX idx_book_chapter (book, chapter),
  INDEX idx_search (text)
);
```

#### people
```sql
CREATE TABLE people (
  uid VARCHAR(20) PRIMARY KEY,  -- PER-000001
  name VARCHAR(255) NOT NULL,
  description TEXT,
  references TEXT  -- JSON array of verse UIDs
);
```

#### places
```sql
CREATE TABLE places (
  uid VARCHAR(20) PRIMARY KEY,  -- PLC-000045
  name VARCHAR(255) NOT NULL,
  description TEXT,
  references TEXT  -- JSON array of verse UIDs
);
```

#### topics
```sql
CREATE TABLE topics (
  uid VARCHAR(20) PRIMARY KEY,  -- TOP-000101
  name VARCHAR(255) NOT NULL,
  description TEXT,
  references TEXT  -- JSON array of verse UIDs
);
```

#### events
```sql
CREATE TABLE events (
  uid VARCHAR(20) PRIMARY KEY,  -- EVT-000001
  name VARCHAR(255) NOT NULL,
  description TEXT,
  references TEXT  -- JSON array of verse UIDs
);
```

#### lexicon
```sql
CREATE TABLE lexicon (
  uid VARCHAR(20) PRIMARY KEY,  -- LEX-000001
  word VARCHAR(255) NOT NULL,
  original VARCHAR(255),
  transliteration VARCHAR(255),
  definition TEXT,
  strongs_number VARCHAR(20)
);
```

#### verse_links (Junction Table)
```sql
CREATE TABLE verse_links (
  verse_uid VARCHAR(20) NOT NULL,
  entity_uid VARCHAR(20) NOT NULL,
  entity_type VARCHAR(20) NOT NULL,  -- 'person', 'place', 'topic', 'event', 'lexicon'
  PRIMARY KEY (verse_uid, entity_uid),
  FOREIGN KEY (verse_uid) REFERENCES verses(uid),
  INDEX idx_verse (verse_uid),
  INDEX idx_entity (entity_uid)
);
```

#### commentary
```sql
CREATE TABLE commentary (
  uid VARCHAR(50) PRIMARY KEY,
  verse_uid VARCHAR(20) NOT NULL,
  author VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  source VARCHAR(255),
  FOREIGN KEY (verse_uid) REFERENCES verses(uid),
  INDEX idx_verse (verse_uid)
);
```

#### audio_map
```sql
CREATE TABLE audio_map (
  verse_uid VARCHAR(20) PRIMARY KEY,
  file_path VARCHAR(500) NOT NULL,
  narrator VARCHAR(255),
  FOREIGN KEY (verse_uid) REFERENCES verses(uid)
);
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database

Copy `.env.example` to `.env` and configure:

```env
# For PostgreSQL
DB_TYPE=postgresql
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=bible_db
PG_USER=your_username
PG_PASSWORD=your_password

# For SQLite
# DB_TYPE=sqlite
# SQLITE_PATH=./local_bible.db

# AI Configuration
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
# or
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Build the Plugin

```bash
# Development (with watch mode)
npm run dev

# Production build
npm run build
```

### 4. Install in Obsidian

1. Copy the entire project folder to `.obsidian/plugins/` in your vault
2. Enable the plugin in Obsidian Settings → Community Plugins
3. Configure database connection in plugin settings

## Features

### 3-Panel Layout

**Center Panel:** Bible text with verse-by-verse display
**Left Panel (configurable):**
- Commentary
- Lexicon/Word Studies
- Topics
- Cross-references

**Right Panel (configurable):**
- AI Assistant
- Personal Notes
- Additional commentary

### View Modes

1. **Plain Read** - Clean, distraction-free reading
2. **Study Mode** - Entity highlighting and hover tooltips
3. **AI Mode** - Integrated AI assistant with contextual queries

### Entity Highlighting Colors

- **People**: Blue (#4A90E2)
- **Places**: Green (#50C878)
- **Topics**: Purple (#9B59B6)
- **Events**: Orange (#FF9500)
- **Lexicon**: Gold (#FFD700)

### AI Integration

Supports both OpenAI (GPT) and Anthropic (Claude):
- Contextual queries with surrounding verses
- Automatic Bible reference extraction
- Markdown-formatted responses
- Integration with database entities

### Obsidian Note Generation

Each verse can be exported as an Obsidian note with:
- YAML frontmatter containing UIDs and metadata
- Linked entities (people, places, topics, etc.)
- Personal study notes section
- Bi-directional links

Example:
```markdown
---
uid: VR-KJV-010101-AA
book: Genesis
chapter: 1
verse: 1
linked_topics: [TOP-000101, TOP-000202]
---

# Genesis 1:1

> In the beginning God created the heaven and the earth.

## Topics
- [[TOP-000101|Creation]]
- [[TOP-000202|God's Power]]

## Study Notes
_Add your personal study notes here..._
```

## API Reference

### DatabaseAdapter

Abstract class implemented by both PostgreSQL and SQLite adapters.

**Methods:**
- `getVerse(uid: string): Promise<Verse | null>`
- `getVersesByChapter(book: string, chapter: number): Promise<Verse[]>`
- `searchVerses(query: string): Promise<Verse[]>`
- `getPerson(uid: string): Promise<Person | null>`
- `getPlace(uid: string): Promise<Place | null>`
- `getTopic(uid: string): Promise<Topic | null>`
- `getEvent(uid: string): Promise<Event | null>`
- `getLexiconEntry(uid: string): Promise<LexiconEntry | null>`
- `getVerseLinks(verseUid: string): Promise<VerseLink[]>`
- `getLinkedEntities(verseUid: string): Promise<object>`
- `getCommentary(verseUid: string): Promise<Commentary[]>`
- `getAudioPath(verseUid: string): Promise<string | null>`

### AIService

**Methods:**
- `query(message: string, context: object): Promise<string>`

Context includes:
- `currentVerse` - The active verse
- `surroundingVerses` - Verses before/after for context
- `additionalContext` - Any extra information

### VerseNoteGenerator

**Methods:**
- `generateVerseMd(verse: Verse, linkedEntities: object): string`
- `sanitizeFilename(book: string, chapter: number, verse: number): string`

### UIDParser

**Methods:**
- `parseVerseUID(uid: string): object | null`
- `parsePersonUID(uid: string): number | null`
- `parsePlaceUID(uid: string): number | null`
- `parseTopicUID(uid: string): number | null`
- `parseEventUID(uid: string): number | null`
- `parseLexiconUID(uid: string): number | null`
- `getEntityType(uid: string): string | null`
- `isValid(uid: string): boolean`

## Extending the Plugin

### Adding New Entity Types

1. Add interface in `src/types.ts`
2. Add table methods in `src/db/database.ts`
3. Implement in both adapters
4. Add color scheme in `src/styles/color-scheme.json`
5. Update highlighting in `src/components/bible-view.ts`

### Adding New Panel Types

1. Update `PanelConfig` type in `src/types.ts`
2. Add panel creation method in `src/components/bible-view.ts`
3. Add settings option in `src/settings.ts`

### Custom AI Providers

1. Extend `AIService` class in `src/ai/ai-service.ts`
2. Add new provider option in settings
3. Implement API call method

## Troubleshooting

**Database Connection Fails:**
- Verify credentials in plugin settings
- Check database server is running
- Ensure network connectivity (for PostgreSQL)

**Plugin Won't Load:**
- Check console for errors (Ctrl+Shift+I)
- Verify all dependencies installed (`npm install`)
- Rebuild plugin (`npm run build`)

**AI Queries Failing:**
- Verify API key in settings
- Check API quota/billing
- Review console for specific error messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

MIT
