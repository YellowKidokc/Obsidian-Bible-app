# Installation Guide

## Quick Start

### Option 1: Install from Obsidian Community Plugins (Coming Soon)

1. Open Obsidian Settings
2. Go to Community Plugins
3. Search for "Bible Study App"
4. Click Install
5. Enable the plugin

### Option 2: Manual Installation

1. Download the latest release from GitHub
2. Extract to `.obsidian/plugins/obsidian-bible-app/` in your vault
3. Reload Obsidian
4. Enable the plugin in Settings → Community Plugins

### Option 3: Build from Source

```bash
# Clone the repository
git clone https://github.com/yourusername/obsidian-bible-app.git
cd obsidian-bible-app

# Install dependencies
npm install

# Build the plugin
npm run build

# Copy to your Obsidian vault
cp -r . /path/to/your/vault/.obsidian/plugins/obsidian-bible-app/
```

## Database Setup

You have two options for the database:

### Option A: SQLite (Recommended for Personal Use)

1. Download the pre-built SQLite database: [bible_kjv.db](link-to-database)
2. Place it in your vault folder
3. In plugin settings, set:
   - Database Type: SQLite
   - Database Path: `./bible_kjv.db`

### Option B: PostgreSQL (Recommended for Cloud/Shared Use)

1. Install PostgreSQL on your server
2. Create a new database:
   ```sql
   CREATE DATABASE bible_db;
   ```
3. Import the schema:
   ```bash
   psql -U your_user -d bible_db -f schema.sql
   ```
4. Import the data (download from link or use your existing database)
5. In plugin settings, configure:
   - Database Type: PostgreSQL
   - Host: your-server.com
   - Port: 5432
   - Database: bible_db
   - User: your_username
   - Password: your_password

## Database Data Sources

If you're setting up the database from scratch, you'll need:

1. **Bible Text**: Download KJV or other translations
   - Sources: [Bible API](https://bible-api.com/), [ESV API](https://api.esv.org/)
   - Format with UIDs: `VR-KJV-BBCCVV-AA`

2. **People, Places, Topics**: Use existing resources or build incrementally
   - OpenBible.info
   - Nave's Topical Bible
   - Thompson Chain Reference

3. **Lexicon Data**:
   - Strong's Concordance
   - Blue Letter Bible API

4. **Commentary** (optional):
   - Matthew Henry's Commentary (public domain)
   - Gill's Exposition (public domain)
   - Treasury of Scripture Knowledge

## AI Configuration (Optional)

To enable AI features:

1. Get an API key:
   - **OpenAI**: https://platform.openai.com/api-keys
   - **Anthropic**: https://console.anthropic.com/

2. In plugin settings:
   - Select AI Provider
   - Enter your API key
   - Choose model (GPT-4, Claude 3, etc.)

**Note**: AI features require internet connection and may incur API costs.

## Audio Files (Optional)

To enable verse narration:

1. Download audio files (organized by verse UID)
2. Place in `public/audio/` folder
3. Update `audio_map` table with file paths
4. Enable auto-play in settings if desired

Recommended sources:
- [Bible.is Audio](https://www.bible.is/)
- [YouVersion](https://www.youversion.com/)

## Verification

After installation:

1. Open Obsidian
2. Click the book icon in the left ribbon
3. You should see the Bible Study view with Genesis 1
4. Try clicking a verse
5. Check that panels load correctly

If you see errors, check the console (Ctrl+Shift+I) and verify:
- Database connection settings
- File paths are correct
- All dependencies installed (`npm install`)

## Troubleshooting

**"Failed to connect to database"**
- Verify database credentials in settings
- For PostgreSQL, ensure server is accessible
- For SQLite, check file path is correct

**"Plugin failed to load"**
- Open console (Ctrl+Shift+I) for error details
- Try rebuilding: `npm run build`
- Check that `main.js` exists in plugin folder

**"No verses loading"**
- Verify database has data: `SELECT COUNT(*) FROM verses;`
- Check database schema matches expected format
- Review console for SQL errors

**AI queries failing**
- Verify API key is correct
- Check internet connection
- Ensure account has credits/billing enabled

## Getting Help

- GitHub Issues: [Report bugs or request features](https://github.com/yourusername/obsidian-bible-app/issues)
- Discussions: [Community Q&A](https://github.com/yourusername/obsidian-bible-app/discussions)
- Documentation: [Full docs](README_DEV.md)

## Next Steps

After installation:
1. Explore the three view modes (Plain, Study, AI)
2. Try different panel configurations
3. Generate Obsidian notes from verses
4. Customize color scheme in settings
5. Set up your personal study workflow
