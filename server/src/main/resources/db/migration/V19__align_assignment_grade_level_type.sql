ALTER TABLE assignments
    ALTER COLUMN grade_level TYPE INTEGER
    USING grade_level::INTEGER;
