-- Bible Study App Database Schema
-- Supports both PostgreSQL and SQLite

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Verses table (primary text storage)
CREATE TABLE IF NOT EXISTS verses (
  uid VARCHAR(20) PRIMARY KEY,  -- Format: VR-KJV-010101-AA
  book VARCHAR(50) NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT NOT NULL,
  translation VARCHAR(10) DEFAULT 'KJV'
);

CREATE INDEX IF NOT EXISTS idx_verses_book_chapter ON verses(book, chapter);
CREATE INDEX IF NOT EXISTS idx_verses_translation ON verses(translation);

-- ============================================================================
-- ENTITY TABLES
-- ============================================================================

-- People mentioned in scripture
CREATE TABLE IF NOT EXISTS people (
  uid VARCHAR(20) PRIMARY KEY,  -- Format: PER-000001
  name VARCHAR(255) NOT NULL,
  description TEXT,
  references TEXT  -- JSON array of verse UIDs
);

CREATE INDEX IF NOT EXISTS idx_people_name ON people(name);

-- Places mentioned in scripture
CREATE TABLE IF NOT EXISTS places (
  uid VARCHAR(20) PRIMARY KEY,  -- Format: PLC-000045
  name VARCHAR(255) NOT NULL,
  description TEXT,
  references TEXT  -- JSON array of verse UIDs
);

CREATE INDEX IF NOT EXISTS idx_places_name ON places(name);

-- Topics and themes
CREATE TABLE IF NOT EXISTS topics (
  uid VARCHAR(20) PRIMARY KEY,  -- Format: TOP-000101
  name VARCHAR(255) NOT NULL,
  description TEXT,
  references TEXT  -- JSON array of verse UIDs
);

CREATE INDEX IF NOT EXISTS idx_topics_name ON topics(name);

-- Events in biblical history
CREATE TABLE IF NOT EXISTS events (
  uid VARCHAR(20) PRIMARY KEY,  -- Format: EVT-000001
  name VARCHAR(255) NOT NULL,
  description TEXT,
  references TEXT  -- JSON array of verse UIDs
);

CREATE INDEX IF NOT EXISTS idx_events_name ON events(name);

-- Lexicon entries (Hebrew/Greek word studies)
CREATE TABLE IF NOT EXISTS lexicon (
  uid VARCHAR(20) PRIMARY KEY,  -- Format: LEX-000001
  word VARCHAR(255) NOT NULL,
  original VARCHAR(255),        -- Hebrew or Greek
  transliteration VARCHAR(255),
  definition TEXT,
  strongs_number VARCHAR(20)
);

CREATE INDEX IF NOT EXISTS idx_lexicon_word ON lexicon(word);
CREATE INDEX IF NOT EXISTS idx_lexicon_strongs ON lexicon(strongs_number);

-- ============================================================================
-- LINKING TABLES
-- ============================================================================

-- Junction table connecting verses to all entity types
CREATE TABLE IF NOT EXISTS verse_links (
  verse_uid VARCHAR(20) NOT NULL,
  entity_uid VARCHAR(20) NOT NULL,
  entity_type VARCHAR(20) NOT NULL,  -- 'person', 'place', 'topic', 'event', 'lexicon'
  PRIMARY KEY (verse_uid, entity_uid)
);

CREATE INDEX IF NOT EXISTS idx_verse_links_verse ON verse_links(verse_uid);
CREATE INDEX IF NOT EXISTS idx_verse_links_entity ON verse_links(entity_uid);
CREATE INDEX IF NOT EXISTS idx_verse_links_type ON verse_links(entity_type);

-- ============================================================================
-- COMMENTARY AND STUDY AIDS
-- ============================================================================

-- Commentary from various sources
CREATE TABLE IF NOT EXISTS commentary (
  uid VARCHAR(50) PRIMARY KEY,
  verse_uid VARCHAR(20) NOT NULL,
  author VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  source VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_commentary_verse ON commentary(verse_uid);
CREATE INDEX IF NOT EXISTS idx_commentary_author ON commentary(author);

-- Cross-references between verses
CREATE TABLE IF NOT EXISTS cross_references (
  verse_uid VARCHAR(20) NOT NULL,
  referenced_verse_uid VARCHAR(20) NOT NULL,
  reference_type VARCHAR(50),  -- 'parallel', 'quotation', 'allusion', 'thematic'
  PRIMARY KEY (verse_uid, referenced_verse_uid)
);

CREATE INDEX IF NOT EXISTS idx_cross_refs_verse ON cross_references(verse_uid);
CREATE INDEX IF NOT EXISTS idx_cross_refs_referenced ON cross_references(referenced_verse_uid);

-- ============================================================================
-- MEDIA
-- ============================================================================

-- Audio narration mapping
CREATE TABLE IF NOT EXISTS audio_map (
  verse_uid VARCHAR(20) PRIMARY KEY,
  file_path VARCHAR(500) NOT NULL,
  narrator VARCHAR(255),
  duration_seconds INTEGER
);

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================

-- Sample verse: Genesis 1:1
INSERT OR IGNORE INTO verses (uid, book, chapter, verse, text, translation) VALUES
('VR-KJV-010101-AA', 'Genesis', 1, 1, 'In the beginning God created the heaven and the earth.', 'KJV');

-- Sample topic: Creation
INSERT OR IGNORE INTO topics (uid, name, description, references) VALUES
('TOP-000001', 'Creation', 'The divine act of bringing the universe into existence', '["VR-KJV-010101-AA"]');

-- Sample person: God
INSERT OR IGNORE INTO people (uid, name, description, references) VALUES
('PER-000001', 'God', 'The Supreme Being, Creator of all things', '["VR-KJV-010101-AA"]');

-- Link verse to entities
INSERT OR IGNORE INTO verse_links (verse_uid, entity_uid, entity_type) VALUES
('VR-KJV-010101-AA', 'TOP-000001', 'topic'),
('VR-KJV-010101-AA', 'PER-000001', 'person');

-- ============================================================================
-- UTILITY VIEWS
-- ============================================================================

-- View for verse with all linked entities (PostgreSQL/SQLite compatible)
CREATE VIEW IF NOT EXISTS verse_details AS
SELECT
  v.uid,
  v.book,
  v.chapter,
  v.verse,
  v.text,
  v.translation,
  (SELECT COUNT(*) FROM verse_links vl WHERE vl.verse_uid = v.uid AND vl.entity_type = 'person') as people_count,
  (SELECT COUNT(*) FROM verse_links vl WHERE vl.verse_uid = v.uid AND vl.entity_type = 'place') as places_count,
  (SELECT COUNT(*) FROM verse_links vl WHERE vl.verse_uid = v.uid AND vl.entity_type = 'topic') as topics_count,
  (SELECT COUNT(*) FROM verse_links vl WHERE vl.verse_uid = v.uid AND vl.entity_type = 'event') as events_count,
  (SELECT COUNT(*) FROM verse_links vl WHERE vl.verse_uid = v.uid AND vl.entity_type = 'lexicon') as lexicon_count
FROM verses v;

-- ============================================================================
-- NOTES FOR DATABASE ADMINISTRATORS
-- ============================================================================

-- UID Format Standards:
-- Verses: VR-{TRANSLATION}-{BOOK:2}{CHAPTER:2}{VERSE:2}-{SUFFIX:2}
--   Example: VR-KJV-010101-AA (Genesis 1:1 in KJV)
--   Book: 01=Genesis, 02=Exodus, etc.
--   SUFFIX: AA, AB, AC... for multiple translations or variants
--
-- Entities: {PREFIX}-{NUMBER:6}
--   PER-000001 (Person #1)
--   PLC-000045 (Place #45)
--   TOP-000101 (Topic #101)
--   EVT-000001 (Event #1)
--   LEX-000001 (Lexicon entry #1)
--
-- UIDs must be stable and never change once assigned!

-- For PostgreSQL, you may want to add:
-- ALTER TABLE verses ADD COLUMN tsv tsvector;
-- CREATE INDEX idx_verses_tsv ON verses USING GIN(tsv);
-- CREATE TRIGGER verses_tsv_update BEFORE INSERT OR UPDATE ON verses
--   FOR EACH ROW EXECUTE FUNCTION tsvector_update_trigger(tsv, 'pg_catalog.english', text);

-- For SQLite full-text search:
-- CREATE VIRTUAL TABLE verses_fts USING fts5(uid, text, content=verses, content_rowid=rowid);
