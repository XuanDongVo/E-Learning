ALTER TABLE vocabulary_words
    ADD COLUMN related_terms JSONB NOT NULL
        DEFAULT '{"wordFamilies":[],"synonyms":[],"antonyms":[]}'::jsonb;
