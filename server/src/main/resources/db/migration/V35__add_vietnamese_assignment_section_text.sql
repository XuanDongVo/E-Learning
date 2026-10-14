-- Add optional Vietnamese translations for assignment section titles and instructions.
-- English fields remain unchanged; Vietnamese translations are not required.

ALTER TABLE assignment_sections
    ADD COLUMN title_vi VARCHAR(200),
    ADD COLUMN instructions_vi TEXT;
