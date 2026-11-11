-- Preserve the original unspecified IPA column for manual audit; historical data
-- cannot be reliably assigned to UK or US without a verified dictionary source.
ALTER TABLE vocabulary_words
    ADD COLUMN pronunciation_uk VARCHAR(100),
    ADD COLUMN pronunciation_us VARCHAR(100);

-- Part of speech was free text (including lower-case fixtures); normalize known
-- values before restricting writes to the typed Java enum set.
UPDATE vocabulary_words SET part_of_speech = UPPER(TRIM(part_of_speech))
WHERE part_of_speech IS NOT NULL;
-- Unknown values intentionally make the next constraint fail instead of being
-- silently discarded. Clean such rows explicitly before deploying the migration.
ALTER TABLE vocabulary_words
    ADD CONSTRAINT ck_vocab_part_of_speech
    CHECK (part_of_speech IN ('NOUN', 'VERB', 'ADJECTIVE', 'ADVERB', 'PREPOSITION', 'PHRASE'));

ALTER TABLE vocabulary_game_sessions
    ADD COLUMN pronunciation_accent VARCHAR(2) NOT NULL DEFAULT 'US',
    ADD CONSTRAINT ck_vocab_game_accent CHECK (pronunciation_accent IN ('US', 'UK'));

-- Immutable membership per game session; do not re-read the current active
-- unit list when the learner finishes a previously started game.
CREATE TABLE vocabulary_game_session_words (
    session_id BIGINT NOT NULL REFERENCES vocabulary_game_sessions(id) ON DELETE CASCADE,
    position INT NOT NULL,
    word_id BIGINT NOT NULL,
    PRIMARY KEY (session_id, position),
    UNIQUE (session_id, word_id)
);
