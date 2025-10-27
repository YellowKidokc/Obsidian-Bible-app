# Bible Study App for Obsidian

A comprehensive Bible study application integrated with Obsidian, featuring SQL database integration, AI-powered study assistance, and intelligent cross-referencing.

## Features

### Core Functionality
- **3-Panel Layout**: Customizable workspace with Bible text, commentary, and AI assistant
- **UUID-Based Architecture**: Every verse and entity has a stable, unique identifier
- **Database Integration**: Support for both PostgreSQL and SQLite
- **Multiple View Modes**:
  - Plain Read - Distraction-free reading
  - Study Mode - Entity highlighting and tooltips
  - AI Mode - Integrated AI assistant

### Intelligent Cross-References
- **People**: Track biblical figures across scripture
- **Places**: Geographical references and locations
- **Topics**: Thematic connections and concepts
- **Events**: Historical events and their references
- **Lexicon**: Hebrew/Greek word studies with Strong's numbers

### AI Integration
- Ask questions about passages with full context
- Powered by OpenAI (GPT) or Anthropic (Claude)
- Automatic verse reference extraction
- Markdown-formatted responses

### Obsidian Integration
- Generate markdown notes for any verse
- YAML frontmatter with UIDs and metadata
- Bi-directional linking between verses and entities
- Personal study notes in your vault

### Color-Coded Highlighting
- People: Blue
- Places: Green
- Topics: Purple
- Events: Orange
- Lexicon: Gold

## Quick Start

### Installation

1. Clone or download this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the plugin
4. Copy to `.obsidian/plugins/` in your Obsidian vault
5. Enable in Obsidian settings

See [INSTALL.md](INSTALL.md) for detailed installation instructions.

### Configuration

1. Open Obsidian Settings → Bible Study App
2. Configure database connection (SQLite or PostgreSQL)
3. Optional: Add AI API key for assistant features
4. Customize panel layout and colors

### Usage

1. Click the book icon in the ribbon to open Bible view
2. Select book and chapter from dropdowns
3. Click verses to see commentary and linked entities
4. Switch between Plain, Study, and AI modes
5. Generate Obsidian notes for deeper study

## Documentation

- [Developer Documentation](README_DEV.md) - Architecture and API reference
- [Installation Guide](INSTALL.md) - Detailed setup instructions
- [Database Schema](schema.sql) - SQL table definitions

## Project Structure

```
Obsidian-Bible-app/
├── src/
│   ├── db/              # Database adapters (PostgreSQL, SQLite)
│   ├── components/      # UI components (3-panel view)
│   ├── ai/              # AI service integration
│   ├── utils/           # UID parsing, note generation
│   └── styles/          # CSS and color schemes
├── main.ts              # Plugin entry point
├── schema.sql           # Database schema
└── docs/                # Documentation
```

## Database Requirements

The plugin requires a database with the following tables:
- `verses` - Bible text with UIDs
- `people`, `places`, `topics`, `events` - Entity data
- `verse_links` - Connections between verses and entities
- `lexicon` - Word studies and definitions
- `commentary` - Commentary from various sources
- `audio_map` - Audio file mappings (optional)

See [schema.sql](schema.sql) for complete schema.

## Development

```bash
# Install dependencies
npm install

# Development mode (with watch)
npm run dev

# Build for production
npm run build

# Run in Obsidian
# Link or copy to .obsidian/plugins/ in your test vault
```

See [README_DEV.md](README_DEV.md) for detailed development guide.

## Technologies

- **TypeScript** - Type-safe development
- **Obsidian API** - Plugin framework
- **PostgreSQL / SQLite** - Database storage
- **OpenAI / Anthropic** - AI integration
- **esbuild** - Fast bundling

## Roadmap

- [ ] Mobile support
- [ ] Multiple translation comparison view
- [ ] Advanced search with filters
- [ ] Export study notes to PDF
- [ ] Collaborative study features
- [ ] Audio playback with sync
- [ ] Interactive maps for places
- [ ] Timeline view for events

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Credits

Built with love for Bible study and knowledge management.

Special thanks to:
- Obsidian team for the excellent platform
- Open source Bible data providers
- The Bible study community

## Support

- Report bugs: [GitHub Issues](https://github.com/yourusername/obsidian-bible-app/issues)
- Feature requests: [Discussions](https://github.com/yourusername/obsidian-bible-app/discussions)
- Documentation: [Wiki](https://github.com/yourusername/obsidian-bible-app/wiki)
