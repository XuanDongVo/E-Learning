ALTER TABLE questions
       DROP CONSTRAINT IF EXISTS ck_questions_type;
ALTER TABLE questions
       ADD CONSTRAINT ck_questions_type
        CHECK (type IN ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE',
                       'FILL_IN_BLANK', 'TYPE_ANSWER', 'MATCHING', 'CLOZE'));



