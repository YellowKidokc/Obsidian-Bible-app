import { Pool, PoolClient } from 'pg';
import { DatabaseAdapter } from './database';
import { Verse, Person, Place, Topic, Event, LexiconEntry, Commentary, VerseLink } from '../types';

export class PostgresAdapter extends DatabaseAdapter {
  private pool: Pool | null = null;

  constructor(
    private host: string,
    private port: number,
    private database: string,
    private user: string,
    private password: string
  ) {
    super();
  }

  async connect(): Promise<void> {
    this.pool = new Pool({
      host: this.host,
      port: this.port,
      database: this.database,
      user: this.user,
      password: this.password,
    });

    // Test connection
    const client = await this.pool.connect();
    client.release();
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  async getVerse(uid: string): Promise<Verse | null> {
    if (!this.pool) throw new Error('Database not connected');

    const result = await this.pool.query(
      'SELECT * FROM verses WHERE uid = $1',
      [uid]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
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
    if (!this.pool) throw new Error('Database not connected');

    const result = await this.pool.query(
      'SELECT * FROM verses WHERE book = $1 AND chapter = $2 ORDER BY verse',
      [book, chapter]
    );

    return result.rows.map(row => ({
      uid: row.uid,
      book: row.book,
      chapter: row.chapter,
      verse: row.verse,
      text: row.text,
      translation: row.translation || 'KJV',
    }));
  }

  async searchVerses(query: string): Promise<Verse[]> {
    if (!this.pool) throw new Error('Database not connected');

    const result = await this.pool.query(
      'SELECT * FROM verses WHERE text ILIKE $1 LIMIT 100',
      [`%${query}%`]
    );

    return result.rows.map(row => ({
      uid: row.uid,
      book: row.book,
      chapter: row.chapter,
      verse: row.verse,
      text: row.text,
      translation: row.translation || 'KJV',
    }));
  }

  async getPerson(uid: string): Promise<Person | null> {
    if (!this.pool) throw new Error('Database not connected');

    const result = await this.pool.query(
      'SELECT * FROM people WHERE uid = $1',
      [uid]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      uid: row.uid,
      name: row.name,
      description: row.description,
      references: row.references,
    };
  }

  async getPlace(uid: string): Promise<Place | null> {
    if (!this.pool) throw new Error('Database not connected');

    const result = await this.pool.query(
      'SELECT * FROM places WHERE uid = $1',
      [uid]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      uid: row.uid,
      name: row.name,
      description: row.description,
      references: row.references,
    };
  }

  async getTopic(uid: string): Promise<Topic | null> {
    if (!this.pool) throw new Error('Database not connected');

    const result = await this.pool.query(
      'SELECT * FROM topics WHERE uid = $1',
      [uid]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      uid: row.uid,
      name: row.name,
      description: row.description,
      references: row.references,
    };
  }

  async getEvent(uid: string): Promise<Event | null> {
    if (!this.pool) throw new Error('Database not connected');

    const result = await this.pool.query(
      'SELECT * FROM events WHERE uid = $1',
      [uid]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      uid: row.uid,
      name: row.name,
      description: row.description,
      references: row.references,
    };
  }

  async getLexiconEntry(uid: string): Promise<LexiconEntry | null> {
    if (!this.pool) throw new Error('Database not connected');

    const result = await this.pool.query(
      'SELECT * FROM lexicon WHERE uid = $1',
      [uid]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
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
    if (!this.pool) throw new Error('Database not connected');

    const result = await this.pool.query(
      'SELECT * FROM verse_links WHERE verse_uid = $1',
      [verseUid]
    );

    return result.rows.map(row => ({
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
    if (!this.pool) throw new Error('Database not connected');

    const result = await this.pool.query(
      'SELECT * FROM commentary WHERE verse_uid = $1',
      [verseUid]
    );

    return result.rows.map(row => ({
      uid: row.uid,
      verse_uid: row.verse_uid,
      author: row.author,
      text: row.text,
      source: row.source,
    }));
  }

  async getAudioPath(verseUid: string): Promise<string | null> {
    if (!this.pool) throw new Error('Database not connected');

    const result = await this.pool.query(
      'SELECT file_path FROM audio_map WHERE verse_uid = $1',
      [verseUid]
    );

    if (result.rows.length === 0) return null;
    return result.rows[0].file_path;
  }
}
