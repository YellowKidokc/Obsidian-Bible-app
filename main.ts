import { Plugin } from 'obsidian';
import { BibleAppSettings } from './src/types';
import { DEFAULT_SETTINGS, BibleAppSettingTab } from './src/settings';
import { DatabaseAdapter } from './src/db/database';
import { PostgresAdapter } from './src/db/postgres-adapter';
import { SQLiteAdapter } from './src/db/sqlite-adapter';
import { BibleView, VIEW_TYPE_BIBLE } from './src/components/bible-view';

export default class BibleAppPlugin extends Plugin {
  settings: BibleAppSettings;
  db: DatabaseAdapter;

  async onload() {
    await this.loadSettings();

    // Initialize database connection
    await this.initializeDatabase();

    // Register Bible view
    this.registerView(
      VIEW_TYPE_BIBLE,
      (leaf) => new BibleView(leaf, this)
    );

    // Add ribbon icon to open Bible view
    this.addRibbonIcon('book-open', 'Open Bible', () => {
      this.activateBibleView();
    });

    // Add command to open Bible
    this.addCommand({
      id: 'open-bible-view',
      name: 'Open Bible Study View',
      callback: () => {
        this.activateBibleView();
      }
    });

    // Add command to search verses
    this.addCommand({
      id: 'search-verses',
      name: 'Search Bible Verses',
      callback: () => {
        // Will implement search modal
      }
    });

    // Add settings tab
    this.addSettingTab(new BibleAppSettingTab(this.app, this));

    console.log('Bible Study App loaded');
  }

  async onunload() {
    // Disconnect from database
    if (this.db) {
      await this.db.disconnect();
    }

    console.log('Bible Study App unloaded');
  }

  async initializeDatabase() {
    try {
      if (this.settings.dbType === 'postgresql') {
        this.db = new PostgresAdapter(
          this.settings.pgHost,
          this.settings.pgPort,
          this.settings.pgDatabase,
          this.settings.pgUser,
          this.settings.pgPassword
        );
      } else {
        this.db = new SQLiteAdapter(this.settings.sqlitePath);
      }

      await this.db.connect();
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Failed to connect to database:', error);
      // Show error notice to user
    }
  }

  async activateBibleView() {
    const { workspace } = this.app;

    let leaf = workspace.getLeavesOfType(VIEW_TYPE_BIBLE)[0];

    if (!leaf) {
      // Create new leaf in main area
      leaf = workspace.getRightLeaf(false);
      await leaf.setViewState({
        type: VIEW_TYPE_BIBLE,
        active: true,
      });
    }

    workspace.revealLeaf(leaf);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
