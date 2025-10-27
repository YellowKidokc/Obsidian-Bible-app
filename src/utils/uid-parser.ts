/**
 * Utilities for parsing and validating UIDs
 */

export class UIDParser {
  static parseVerseUID(uid: string): {
    translation: string;
    book: number;
    chapter: number;
    verse: number;
    suffix: string;
  } | null {
    // Format: VR-KJV-010101-AA
    const match = uid.match(/^VR-([A-Z]+)-(\d{2})(\d{2})(\d{2})-([A-Z]{2})$/);

    if (!match) return null;

    return {
      translation: match[1],
      book: parseInt(match[2]),
      chapter: parseInt(match[3]),
      verse: parseInt(match[4]),
      suffix: match[5]
    };
  }

  static parsePersonUID(uid: string): number | null {
    // Format: PER-000001
    const match = uid.match(/^PER-(\d{6})$/);
    return match ? parseInt(match[1]) : null;
  }

  static parsePlaceUID(uid: string): number | null {
    // Format: PLC-000045
    const match = uid.match(/^PLC-(\d{6})$/);
    return match ? parseInt(match[1]) : null;
  }

  static parseTopicUID(uid: string): number | null {
    // Format: TOP-000101
    const match = uid.match(/^TOP-(\d{6})$/);
    return match ? parseInt(match[1]) : null;
  }

  static parseEventUID(uid: string): number | null {
    // Format: EVT-000001
    const match = uid.match(/^EVT-(\d{6})$/);
    return match ? parseInt(match[1]) : null;
  }

  static parseLexiconUID(uid: string): number | null {
    // Format: LEX-000001
    const match = uid.match(/^LEX-(\d{6})$/);
    return match ? parseInt(match[1]) : null;
  }

  static getEntityType(uid: string): string | null {
    if (uid.startsWith('VR-')) return 'verse';
    if (uid.startsWith('PER-')) return 'person';
    if (uid.startsWith('PLC-')) return 'place';
    if (uid.startsWith('TOP-')) return 'topic';
    if (uid.startsWith('EVT-')) return 'event';
    if (uid.startsWith('LEX-')) return 'lexicon';
    return null;
  }

  static isValid(uid: string): boolean {
    return this.getEntityType(uid) !== null;
  }
}
