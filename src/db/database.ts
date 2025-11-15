import { Verse, Person, Place, Topic, Event, LexiconEntry, Commentary, VerseLink, AudioMapping } from '../types';

/**
 * Abstract database interface
 * Supports both PostgreSQL and SQLite
 */
export abstract class DatabaseAdapter {
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;

  // Verse operations
  abstract getVerse(uid: string): Promise<Verse | null>;
  abstract getVersesByChapter(book: string, chapter: number): Promise<Verse[]>;
  abstract searchVerses(query: string): Promise<Verse[]>;

  // Entity operations
  abstract getPerson(uid: string): Promise<Person | null>;
  abstract getPlace(uid: string): Promise<Place | null>;
  abstract getTopic(uid: string): Promise<Topic | null>;
  abstract getEvent(uid: string): Promise<Event | null>;
  abstract getLexiconEntry(uid: string): Promise<LexiconEntry | null>;

  // Links
  abstract getVerseLinks(verseUid: string): Promise<VerseLink[]>;
  abstract getLinkedEntities(verseUid: string): Promise<{
    people: Person[];
    places: Place[];
    topics: Topic[];
    events: Event[];
    lexicon: LexiconEntry[];
  }>;

  // Commentary
  abstract getCommentary(verseUid: string): Promise<Commentary[]>;

  // Audio
  abstract getAudioPath(verseUid: string): Promise<string | null>;
}
