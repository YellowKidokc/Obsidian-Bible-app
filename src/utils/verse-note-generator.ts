import { Verse, Person, Place, Topic, Event, LexiconEntry } from '../types';

/**
 * Generates Obsidian markdown notes for verses with YAML frontmatter
 */
export class VerseNoteGenerator {
  static generateVerseMd(
    verse: Verse,
    linkedEntities: {
      people: Person[];
      places: Place[];
      topics: Topic[];
      events: Event[];
      lexicon: LexiconEntry[];
    }
  ): string {
    const frontmatter = this.generateFrontmatter(verse, linkedEntities);
    const body = this.generateBody(verse, linkedEntities);

    return `---\n${frontmatter}---\n\n${body}`;
  }

  private static generateFrontmatter(
    verse: Verse,
    linkedEntities: {
      people: Person[];
      places: Place[];
      topics: Topic[];
      events: Event[];
      lexicon: LexiconEntry[];
    }
  ): string {
    const lines: string[] = [];

    lines.push(`uid: ${verse.uid}`);
    lines.push(`book: ${verse.book}`);
    lines.push(`chapter: ${verse.chapter}`);
    lines.push(`verse: ${verse.verse}`);
    lines.push(`translation: ${verse.translation}`);

    if (linkedEntities.people.length > 0) {
      lines.push(`linked_people: [${linkedEntities.people.map(p => p.uid).join(', ')}]`);
    }

    if (linkedEntities.places.length > 0) {
      lines.push(`linked_places: [${linkedEntities.places.map(p => p.uid).join(', ')}]`);
    }

    if (linkedEntities.topics.length > 0) {
      lines.push(`linked_topics: [${linkedEntities.topics.map(t => t.uid).join(', ')}]`);
    }

    if (linkedEntities.events.length > 0) {
      lines.push(`linked_events: [${linkedEntities.events.map(e => e.uid).join(', ')}]`);
    }

    if (linkedEntities.lexicon.length > 0) {
      lines.push(`linked_lexicon: [${linkedEntities.lexicon.map(l => l.uid).join(', ')}]`);
    }

    return lines.join('\n') + '\n';
  }

  private static generateBody(
    verse: Verse,
    linkedEntities: {
      people: Person[];
      places: Place[];
      topics: Topic[];
      events: Event[];
      lexicon: LexiconEntry[];
    }
  ): string {
    let body = '';

    // Verse reference and text
    body += `# ${verse.book} ${verse.chapter}:${verse.verse}\n\n`;
    body += `> ${verse.text}\n\n`;

    // Linked entities
    if (linkedEntities.people.length > 0) {
      body += `## People\n\n`;
      linkedEntities.people.forEach(person => {
        body += `- [[${person.uid}|${person.name}]]\n`;
      });
      body += '\n';
    }

    if (linkedEntities.places.length > 0) {
      body += `## Places\n\n`;
      linkedEntities.places.forEach(place => {
        body += `- [[${place.uid}|${place.name}]]\n`;
      });
      body += '\n';
    }

    if (linkedEntities.topics.length > 0) {
      body += `## Topics\n\n`;
      linkedEntities.topics.forEach(topic => {
        body += `- [[${topic.uid}|${topic.name}]]\n`;
      });
      body += '\n';
    }

    if (linkedEntities.events.length > 0) {
      body += `## Events\n\n`;
      linkedEntities.events.forEach(event => {
        body += `- [[${event.uid}|${event.name}]]\n`;
      });
      body += '\n';
    }

    if (linkedEntities.lexicon.length > 0) {
      body += `## Word Studies\n\n`;
      linkedEntities.lexicon.forEach(lex => {
        body += `- **${lex.word}** (${lex.original}): ${lex.definition}\n`;
      });
      body += '\n';
    }

    // Add study notes section
    body += `## Study Notes\n\n`;
    body += `_Add your personal study notes here..._\n\n`;

    return body;
  }

  static sanitizeFilename(book: string, chapter: number, verse: number): string {
    return `${book.replace(/\s+/g, '_')}_${chapter}_${verse}.md`;
  }
}
