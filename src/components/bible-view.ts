import { ItemView, WorkspaceLeaf } from 'obsidian';
import BibleAppPlugin from '../../main';
import { Verse, ViewMode } from '../types';

export const VIEW_TYPE_BIBLE = 'bible-study-view';

export class BibleView extends ItemView {
  plugin: BibleAppPlugin;
  currentBook: string = 'Genesis';
  currentChapter: number = 1;
  viewMode: ViewMode = 'study';
  verses: Verse[] = [];

  constructor(leaf: WorkspaceLeaf, plugin: BibleAppPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE_BIBLE;
  }

  getDisplayText(): string {
    return 'Bible Study';
  }

  getIcon(): string {
    return 'book-open';
  }

  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass('bible-app-container');

    // Create main layout
    this.createLayout(container);

    // Load initial chapter
    await this.loadChapter(this.currentBook, this.currentChapter);
  }

  async onClose() {
    // Cleanup
  }

  private createLayout(container: HTMLElement) {
    // Create toolbar
    const toolbar = container.createDiv({ cls: 'bible-toolbar' });
    this.createToolbar(toolbar);

    // Create 3-panel layout
    const mainArea = container.createDiv({ cls: 'bible-main-area' });

    // Left panel (commentary/lexicon/etc)
    if (this.plugin.settings.leftPanel.enabled) {
      const leftPanel = mainArea.createDiv({ cls: 'bible-left-panel' });
      leftPanel.style.width = `${this.plugin.settings.leftPanel.width}px`;
      this.createLeftPanel(leftPanel);
    }

    // Center panel (Bible text)
    const centerPanel = mainArea.createDiv({ cls: 'bible-center-panel' });
    this.createCenterPanel(centerPanel);

    // Right panel (AI/notes)
    if (this.plugin.settings.rightPanel.enabled) {
      const rightPanel = mainArea.createDiv({ cls: 'bible-right-panel' });
      rightPanel.style.width = `${this.plugin.settings.rightPanel.width}px`;
      this.createRightPanel(rightPanel);
    }
  }

  private createToolbar(toolbar: HTMLElement) {
    // Book selector
    const bookSelect = toolbar.createEl('select', { cls: 'bible-book-select' });
    const books = this.getBibleBooks();
    books.forEach(book => {
      const option = bookSelect.createEl('option', { value: book, text: book });
      if (book === this.currentBook) {
        option.selected = true;
      }
    });
    bookSelect.addEventListener('change', async (e) => {
      this.currentBook = (e.target as HTMLSelectElement).value;
      await this.loadChapter(this.currentBook, this.currentChapter);
    });

    // Chapter selector
    const chapterSelect = toolbar.createEl('select', { cls: 'bible-chapter-select' });
    for (let i = 1; i <= 150; i++) { // Max chapters (Psalms)
      const option = chapterSelect.createEl('option', { value: String(i), text: String(i) });
      if (i === this.currentChapter) {
        option.selected = true;
      }
    }
    chapterSelect.addEventListener('change', async (e) => {
      this.currentChapter = parseInt((e.target as HTMLSelectElement).value);
      await this.loadChapter(this.currentBook, this.currentChapter);
    });

    // View mode buttons
    const viewModes = toolbar.createDiv({ cls: 'bible-view-modes' });

    ['plain', 'study', 'ai'].forEach(mode => {
      const btn = viewModes.createEl('button', {
        text: mode.charAt(0).toUpperCase() + mode.slice(1),
        cls: this.viewMode === mode ? 'active' : ''
      });
      btn.addEventListener('click', () => {
        this.viewMode = mode as ViewMode;
        this.refreshView();
      });
    });

    // Navigation buttons
    const navButtons = toolbar.createDiv({ cls: 'bible-nav-buttons' });

    const prevBtn = navButtons.createEl('button', { text: '← Previous' });
    prevBtn.addEventListener('click', () => this.navigatePrevious());

    const nextBtn = navButtons.createEl('button', { text: 'Next →' });
    nextBtn.addEventListener('click', () => this.navigateNext());
  }

  private createLeftPanel(panel: HTMLElement) {
    panel.createEl('h3', { text: this.getPanelTitle(this.plugin.settings.leftPanel.type) });

    const content = panel.createDiv({ cls: 'bible-panel-content' });
    content.id = 'left-panel-content';

    // Content will be populated when verses are loaded
  }

  private createCenterPanel(panel: HTMLElement) {
    const header = panel.createDiv({ cls: 'bible-chapter-header' });
    header.id = 'chapter-header';

    const versesContainer = panel.createDiv({ cls: 'bible-verses-container' });
    versesContainer.id = 'verses-container';
  }

  private createRightPanel(panel: HTMLElement) {
    panel.createEl('h3', { text: this.getPanelTitle(this.plugin.settings.rightPanel.type) });

    const content = panel.createDiv({ cls: 'bible-panel-content' });
    content.id = 'right-panel-content';

    // For AI panel, add input area
    if (this.plugin.settings.rightPanel.type === 'ai') {
      const aiInput = content.createDiv({ cls: 'bible-ai-input' });

      const textarea = aiInput.createEl('textarea', {
        placeholder: 'Ask about the current passage...',
        cls: 'bible-ai-textarea'
      });

      const sendBtn = aiInput.createEl('button', { text: 'Send', cls: 'bible-ai-send' });
      sendBtn.addEventListener('click', () => {
        this.handleAIQuery(textarea.value);
        textarea.value = '';
      });

      const responseArea = content.createDiv({ cls: 'bible-ai-response' });
      responseArea.id = 'ai-response-area';
    }
  }

  private async loadChapter(book: string, chapter: number) {
    try {
      this.verses = await this.plugin.db.getVersesByChapter(book, chapter);
      await this.renderVerses();
      await this.updatePanels();
    } catch (error) {
      console.error('Failed to load chapter:', error);
    }
  }

  private async renderVerses() {
    const container = document.getElementById('verses-container');
    if (!container) return;

    container.empty();

    // Update header
    const header = document.getElementById('chapter-header');
    if (header) {
      header.empty();
      header.createEl('h2', { text: `${this.currentBook} ${this.currentChapter}` });
    }

    // Render verses
    for (const verse of this.verses) {
      const verseEl = container.createDiv({ cls: 'bible-verse' });
      verseEl.dataset.verseUid = verse.uid;

      if (this.plugin.settings.showLineNumbers) {
        verseEl.createEl('span', {
          cls: 'bible-verse-number',
          text: String(verse.verse)
        });
      }

      const textEl = verseEl.createEl('span', { cls: 'bible-verse-text' });

      if (this.viewMode === 'plain') {
        textEl.setText(verse.text);
      } else {
        // In study mode, we'll highlight entities
        await this.renderHighlightedVerse(textEl, verse);
      }

      // Add click handler
      verseEl.addEventListener('click', () => this.handleVerseClick(verse));
    }
  }

  private async renderHighlightedVerse(container: HTMLElement, verse: Verse) {
    // Get linked entities for this verse
    const entities = await this.plugin.db.getLinkedEntities(verse.uid);

    // For now, just display plain text
    // In the next phase, we'll implement word-level highlighting
    container.setText(verse.text);

    // TODO: Implement intelligent text highlighting based on entity positions
    // This requires additional data about word positions in the database
  }

  private async handleVerseClick(verse: Verse) {
    console.log('Verse clicked:', verse.uid);

    // Update panels with verse-specific content
    await this.updatePanelsForVerse(verse);

    // Play audio if enabled
    if (this.plugin.settings.autoPlayAudio) {
      const audioPath = await this.plugin.db.getAudioPath(verse.uid);
      if (audioPath) {
        this.playAudio(audioPath);
      }
    }
  }

  private async updatePanels() {
    // Update left panel based on type
    const leftContent = document.getElementById('left-panel-content');
    if (leftContent && this.plugin.settings.leftPanel.enabled) {
      leftContent.empty();

      switch (this.plugin.settings.leftPanel.type) {
        case 'commentary':
          await this.loadCommentaryPanel(leftContent);
          break;
        case 'lexicon':
          await this.loadLexiconPanel(leftContent);
          break;
        case 'topics':
          await this.loadTopicsPanel(leftContent);
          break;
        case 'cross-refs':
          await this.loadCrossRefsPanel(leftContent);
          break;
      }
    }
  }

  private async updatePanelsForVerse(verse: Verse) {
    // Load verse-specific data in panels
    const leftContent = document.getElementById('left-panel-content');
    if (leftContent && this.plugin.settings.leftPanel.type === 'commentary') {
      leftContent.empty();
      const commentary = await this.plugin.db.getCommentary(verse.uid);

      if (commentary.length > 0) {
        commentary.forEach(c => {
          const commentDiv = leftContent.createDiv({ cls: 'bible-commentary' });
          commentDiv.createEl('h4', { text: c.author });
          commentDiv.createEl('p', { text: c.text });
        });
      } else {
        leftContent.createEl('p', { text: 'No commentary available for this verse.' });
      }
    }
  }

  private async loadCommentaryPanel(container: HTMLElement) {
    container.createEl('p', {
      text: 'Click a verse to see commentary',
      cls: 'bible-panel-hint'
    });
  }

  private async loadLexiconPanel(container: HTMLElement) {
    container.createEl('p', {
      text: 'Click a verse to see word studies',
      cls: 'bible-panel-hint'
    });
  }

  private async loadTopicsPanel(container: HTMLElement) {
    container.createEl('p', {
      text: 'Click a verse to see related topics',
      cls: 'bible-panel-hint'
    });
  }

  private async loadCrossRefsPanel(container: HTMLElement) {
    container.createEl('p', {
      text: 'Click a verse to see cross-references',
      cls: 'bible-panel-hint'
    });
  }

  private async handleAIQuery(query: string) {
    const responseArea = document.getElementById('ai-response-area');
    if (!responseArea) return;

    // Add user message
    const userMsg = responseArea.createDiv({ cls: 'bible-ai-message user' });
    userMsg.createEl('p', { text: query });

    // TODO: Implement AI API call
    const aiMsg = responseArea.createDiv({ cls: 'bible-ai-message assistant' });
    aiMsg.createEl('p', { text: 'AI integration coming soon...' });
  }

  private playAudio(path: string) {
    const audio = new Audio(path);
    audio.play().catch(err => console.error('Failed to play audio:', err));
  }

  private navigatePrevious() {
    if (this.currentChapter > 1) {
      this.currentChapter--;
      this.loadChapter(this.currentBook, this.currentChapter);
    }
    // TODO: Navigate to previous book if at chapter 1
  }

  private navigateNext() {
    this.currentChapter++;
    this.loadChapter(this.currentBook, this.currentChapter);
    // TODO: Navigate to next book if past last chapter
  }

  private refreshView() {
    this.renderVerses();
  }

  private getPanelTitle(type: string): string {
    const titles: Record<string, string> = {
      'commentary': 'Commentary',
      'lexicon': 'Word Studies',
      'topics': 'Topics',
      'cross-refs': 'Cross References',
      'ai': 'AI Assistant',
      'notes': 'Personal Notes'
    };
    return titles[type] || 'Panel';
  }

  private getBibleBooks(): string[] {
    return [
      'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
      'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
      '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
      'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
      'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
      'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
      'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah',
      'Haggai', 'Zechariah', 'Malachi',
      'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
      '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
      'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
      '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
      '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'
    ];
  }
}
