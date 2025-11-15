import { App, PluginSettingTab, Setting } from 'obsidian';
import BibleAppPlugin from '../main';
import { BibleAppSettings } from './types';

export const DEFAULT_SETTINGS: BibleAppSettings = {
  // Database
  dbType: 'sqlite',
  pgHost: 'localhost',
  pgPort: 5432,
  pgDatabase: 'bible_db',
  pgUser: '',
  pgPassword: '',
  sqlitePath: './local_bible.db',

  // Display
  defaultTranslation: 'KJV',
  colorScheme: {
    people: '#4A90E2',
    places: '#50C878',
    topics: '#9B59B6',
    events: '#FF9500',
    lexicon: '#FFD700',
  },
  showLineNumbers: true,

  // Panels
  leftPanel: {
    enabled: true,
    type: 'commentary',
    width: 300,
  },
  rightPanel: {
    enabled: true,
    type: 'ai',
    width: 300,
  },

  // AI
  aiProvider: 'openai',
  openaiApiKey: '',
  anthropicApiKey: '',
  aiModel: 'gpt-4',
  contextVerses: 3,

  // Audio
  audioBasePath: './public/audio',
  autoPlayAudio: false,
};

export class BibleAppSettingTab extends PluginSettingTab {
  plugin: BibleAppPlugin;

  constructor(app: App, plugin: BibleAppPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Bible Study App Settings' });

    // Database Settings
    containerEl.createEl('h3', { text: 'Database Configuration' });

    new Setting(containerEl)
      .setName('Database Type')
      .setDesc('Choose between PostgreSQL (remote) or SQLite (local)')
      .addDropdown(dropdown => dropdown
        .addOption('sqlite', 'SQLite (Local)')
        .addOption('postgresql', 'PostgreSQL (Remote)')
        .setValue(this.plugin.settings.dbType)
        .onChange(async (value: 'postgresql' | 'sqlite') => {
          this.plugin.settings.dbType = value;
          await this.plugin.saveSettings();
          this.display(); // Refresh to show/hide relevant fields
        }));

    if (this.plugin.settings.dbType === 'postgresql') {
      new Setting(containerEl)
        .setName('PostgreSQL Host')
        .setDesc('Database server hostname or IP')
        .addText(text => text
          .setPlaceholder('localhost')
          .setValue(this.plugin.settings.pgHost)
          .onChange(async (value) => {
            this.plugin.settings.pgHost = value;
            await this.plugin.saveSettings();
          }));

      new Setting(containerEl)
        .setName('PostgreSQL Port')
        .setDesc('Database server port')
        .addText(text => text
          .setPlaceholder('5432')
          .setValue(String(this.plugin.settings.pgPort))
          .onChange(async (value) => {
            this.plugin.settings.pgPort = parseInt(value) || 5432;
            await this.plugin.saveSettings();
          }));

      new Setting(containerEl)
        .setName('Database Name')
        .addText(text => text
          .setPlaceholder('bible_db')
          .setValue(this.plugin.settings.pgDatabase)
          .onChange(async (value) => {
            this.plugin.settings.pgDatabase = value;
            await this.plugin.saveSettings();
          }));

      new Setting(containerEl)
        .setName('Database User')
        .addText(text => text
          .setPlaceholder('username')
          .setValue(this.plugin.settings.pgUser)
          .onChange(async (value) => {
            this.plugin.settings.pgUser = value;
            await this.plugin.saveSettings();
          }));

      new Setting(containerEl)
        .setName('Database Password')
        .addText(text => {
          text.inputEl.type = 'password';
          text.setPlaceholder('password')
            .setValue(this.plugin.settings.pgPassword)
            .onChange(async (value) => {
              this.plugin.settings.pgPassword = value;
              await this.plugin.saveSettings();
            });
        });
    } else {
      new Setting(containerEl)
        .setName('SQLite Database Path')
        .setDesc('Path to local SQLite database file')
        .addText(text => text
          .setPlaceholder('./local_bible.db')
          .setValue(this.plugin.settings.sqlitePath)
          .onChange(async (value) => {
            this.plugin.settings.sqlitePath = value;
            await this.plugin.saveSettings();
          }));
    }

    // Display Settings
    containerEl.createEl('h3', { text: 'Display Settings' });

    new Setting(containerEl)
      .setName('Default Translation')
      .setDesc('Bible translation to display by default')
      .addDropdown(dropdown => dropdown
        .addOption('KJV', 'King James Version')
        .addOption('NIV', 'New International Version')
        .addOption('ESV', 'English Standard Version')
        .addOption('NASB', 'New American Standard Bible')
        .setValue(this.plugin.settings.defaultTranslation)
        .onChange(async (value) => {
          this.plugin.settings.defaultTranslation = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Show Line Numbers')
      .setDesc('Display verse numbers in the main text')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showLineNumbers)
        .onChange(async (value) => {
          this.plugin.settings.showLineNumbers = value;
          await this.plugin.saveSettings();
        }));

    // Panel Settings
    containerEl.createEl('h3', { text: 'Panel Configuration' });

    new Setting(containerEl)
      .setName('Left Panel')
      .setDesc('Enable and configure left sidebar')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.leftPanel.enabled)
        .onChange(async (value) => {
          this.plugin.settings.leftPanel.enabled = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Left Panel Type')
      .addDropdown(dropdown => dropdown
        .addOption('commentary', 'Commentary')
        .addOption('lexicon', 'Lexicon')
        .addOption('topics', 'Topics')
        .addOption('cross-refs', 'Cross References')
        .setValue(this.plugin.settings.leftPanel.type)
        .onChange(async (value: any) => {
          this.plugin.settings.leftPanel.type = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Right Panel')
      .setDesc('Enable and configure right sidebar')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.rightPanel.enabled)
        .onChange(async (value) => {
          this.plugin.settings.rightPanel.enabled = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Right Panel Type')
      .addDropdown(dropdown => dropdown
        .addOption('ai', 'AI Assistant')
        .addOption('notes', 'Personal Notes')
        .addOption('commentary', 'Commentary')
        .setValue(this.plugin.settings.rightPanel.type)
        .onChange(async (value: any) => {
          this.plugin.settings.rightPanel.type = value;
          await this.plugin.saveSettings();
        }));

    // AI Settings
    containerEl.createEl('h3', { text: 'AI Assistant' });

    new Setting(containerEl)
      .setName('AI Provider')
      .addDropdown(dropdown => dropdown
        .addOption('openai', 'OpenAI (GPT)')
        .addOption('anthropic', 'Anthropic (Claude)')
        .setValue(this.plugin.settings.aiProvider)
        .onChange(async (value: 'openai' | 'anthropic') => {
          this.plugin.settings.aiProvider = value;
          await this.plugin.saveSettings();
          this.display();
        }));

    if (this.plugin.settings.aiProvider === 'openai') {
      new Setting(containerEl)
        .setName('OpenAI API Key')
        .addText(text => {
          text.inputEl.type = 'password';
          text.setPlaceholder('sk-...')
            .setValue(this.plugin.settings.openaiApiKey)
            .onChange(async (value) => {
              this.plugin.settings.openaiApiKey = value;
              await this.plugin.saveSettings();
            });
        });

      new Setting(containerEl)
        .setName('Model')
        .addDropdown(dropdown => dropdown
          .addOption('gpt-4', 'GPT-4')
          .addOption('gpt-4-turbo', 'GPT-4 Turbo')
          .addOption('gpt-3.5-turbo', 'GPT-3.5 Turbo')
          .setValue(this.plugin.settings.aiModel)
          .onChange(async (value) => {
            this.plugin.settings.aiModel = value;
            await this.plugin.saveSettings();
          }));
    } else {
      new Setting(containerEl)
        .setName('Anthropic API Key')
        .addText(text => {
          text.inputEl.type = 'password';
          text.setPlaceholder('sk-ant-...')
            .setValue(this.plugin.settings.anthropicApiKey)
            .onChange(async (value) => {
              this.plugin.settings.anthropicApiKey = value;
              await this.plugin.saveSettings();
            });
        });

      new Setting(containerEl)
        .setName('Model')
        .addDropdown(dropdown => dropdown
          .addOption('claude-3-opus-20240229', 'Claude 3 Opus')
          .addOption('claude-3-sonnet-20240229', 'Claude 3 Sonnet')
          .addOption('claude-3-haiku-20240307', 'Claude 3 Haiku')
          .setValue(this.plugin.settings.aiModel)
          .onChange(async (value) => {
            this.plugin.settings.aiModel = value;
            await this.plugin.saveSettings();
          }));
    }

    new Setting(containerEl)
      .setName('Context Verses')
      .setDesc('Number of surrounding verses to include for AI context')
      .addSlider(slider => slider
        .setLimits(0, 10, 1)
        .setValue(this.plugin.settings.contextVerses)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.contextVerses = value;
          await this.plugin.saveSettings();
        }));

    // Audio Settings
    containerEl.createEl('h3', { text: 'Audio' });

    new Setting(containerEl)
      .setName('Audio Files Path')
      .setDesc('Base path for verse audio files')
      .addText(text => text
        .setPlaceholder('./public/audio')
        .setValue(this.plugin.settings.audioBasePath)
        .onChange(async (value) => {
          this.plugin.settings.audioBasePath = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Auto-play Audio')
      .setDesc('Automatically play audio when verse is selected')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.autoPlayAudio)
        .onChange(async (value) => {
          this.plugin.settings.autoPlayAudio = value;
          await this.plugin.saveSettings();
        }));
  }
}
