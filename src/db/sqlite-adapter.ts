import Database from 'better-sqlite3';
import { DatabaseAdapter } from './database';
import { Verse, Person, Place, Topic, Event, LexiconEntry, Commentary, VerseLink } from '../types';

export class SQLiteAdapter extends DatabaseAdapter {
  private db: Database.Database | null = null;

  constructor(private dbPath: string) {
    super();
  }

  async connect(): Promise<void> {
    this.db = new Database(this.dbPath);
  }

  async disconnect(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  async getVerse(uid: string): Promise<Verse | null> {
    if (!this.db) throw new Error('Database not connected');

    const row = this.db.prepare('SELECT * FROM verses WHERE uid = ?').get(uid) as any;

    if (!row) return null;

    return {
      uid: row.uid,
      book: row.book,
      chapter: row.chapter,
      verse: row.verse,
      text: row.text,
      translation: row.translation || 'KJV',
    };
  }

  async getVersesByChapter(book: string, chapter: number): Promise<Verse[]> {
    if (!this.db) throw new Error('Database not connected');

    const rows = this.db.prepare('SELECT * FROM verses WHERE book = ? AND chapter = ? ORDER BY verse').all(book, chapter) as any[];

    return rows.map(row => ({
      uid: row.uid,
      book: row.book,
      chapter: row.chapter,
      verse: row.verse,
      text: row.text,
      translation: row.translation || 'KJV',
    }));
  }

  async searchVerses(query: string): Promise<Verse[]> {
    if (!this.db) throw new Error('Database not connected');

    const rows = this.db.prepare('SELECT * FROM verses WHERE text LIKE ? LIMIT 100').all(`%${query}%`) as any[];

    return rows.map(row => ({
      uid: row.uid,
      book: row.book,
      chapter: row.chapter,
      verse: row.verse,
      text: row.text,
      translation: row.translation || 'KJV',
    }));
  }

  async getPerson(uid: string): Promise<Person | null> {
    if (!this.db) throw new Error('Database not connected');

    const row = this.db.prepare('SELECT * FROM people WHERE uid = ?').get(uid) as any;

    if (!row) return null;

    return {
      uid: row.uid,
      name: row.name,
      description: row.description,
      references: row.references ? JSON.parse(row.references) : [],
    };
  }

  async getPlace(uid: string): Promise<Place | null> {
    if (!this.db) throw new Error('Database not connected');

    const row = this.db.prepare('SELECT * FROM places WHERE uid = ?').get(uid) as any;

    if (!row) return null;

    return {
      uid: row.uid,
      name: row.name,
      description: row.description,
      references: row.references ? JSON.parse(row.references) : [],
    };
  }

  async getTopic(uid: string): Promise<Topic | null> {
    if (!this.db) throw new Error('Database not connected');

    const row = this.db.prepare('SELECT * FROM topics WHERE uid = ?').get(uid) as any;

    if (!row) return null;

    return {
      uid: row.uid,
      name: row.name,
      description: row.description,
      references: row.references ? JSON.parse(row.references) : [],
    };
  }

  async getEvent(uid: string): Promise<Event | null> {
    if (!this.db) throw new Error('Database not connected');

    const row = this.db.prepare('SELECT * FROM events WHERE uid = ?').get(uid) as any;

    if (!row) return null;

    return {
      uid: row.uid,
      name: row.name,
      description: row.description,
      references: row.references ? JSON.parse(row.references) : [],
    };
  }

  async getLexiconEntry(uid: string): Promise<LexiconEntry | null> {
    if (!this.db) throw new Error('Database not connected');

    const row = this.db.prepare('SELECT * FROM lexicon WHERE uid = ?').get(uid) as any;

    if (!row) return null;

    return {
      uid: row.uid,
      word: row.word,
      original: row.original,
      transliteration: row.transliteration,
      definition: row.definition,
      strongsNumber: row.strongs_number,
    };
  }

  async getVerseLinks(verseUid: string): Promise<VerseLink[]> {
    if (!this.db) throw new Error('Database not connected');

    const rows = this.db.prepare('SELECT * FROM verse_links WHERE verse_uid = ?').all(verseUid) as any[];

    return rows.map(row => ({
      verse_uid: row.verse_uid,
      entity_uid: row.entity_uid,
      entity_type: row.entity_type,
    }));
  }

  async getLinkedEntities(verseUid: string) {
    const links = await this.getVerseLinks(verseUid);

    const people: Person[] = [];
    const places: Place[] = [];
    const topics: Topic[] = [];
    const events: Event[] = [];
    const lexicon: LexiconEntry[] = [];

    for (const link of links) {
      switch (link.entity_type) {
        case 'person':
          const person = await this.getPerson(link.entity_uid);
          if (person) people.push(person);
          break;
        case 'place':
          const place = await this.getPlace(link.entity_uid);
          if (place) places.push(place);
          break;
        case 'topic':
          const topic = await this.getTopic(link.entity_uid);
          if (topic) topics.push(topic);
          break;
        case 'event':
          const event = await this.getEvent(link.entity_uid);
          if (event) events.push(event);
          break;
        case 'lexicon':
          const lex = await this.getLexiconEntry(link.entity_uid);
          if (lex) lexicon.push(lex);
          break;
      }
    }

    return { people, places, topics, events, lexicon };
  }

  async getCommentary(verseUid: string): Promise<Commentary[]> {
    if (!this.db) throw new Error('Database not connected');

    const rows = this.db.prepare('SELECT * FROM commentary WHERE verse_uid = ?').all(verseUid) as any[];

    return rows.map(row => ({
      uid: row.uid,
      verse_uid: row.verse_uid,
      author: row.author,
      text: row.text,
      source: row.source,
    }));
  }

  async getAudioPath(verseUid: string): Promise<string | null> {
    if (!this.db) throw new Error('Database not connected');

    const row = this.db.prepare('SELECT file_path FROM audio_map WHERE verse_uid = ?').get(verseUid) as any;

    if (!row) return null;
    return row.file_path;
  }
}
