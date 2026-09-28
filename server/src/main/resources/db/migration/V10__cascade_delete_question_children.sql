-- V10__cascade_delete_question_children.sql

ALTER TABLE content_question_options
DROP CONSTRAINT content_question_options_question_id_fkey,
ADD CONSTRAINT fk_options_question
    FOREIGN KEY (question_id)
    REFERENCES content_questions(id)
    ON DELETE CASCADE;


ALTER TABLE content_question_answers
DROP CONSTRAINT content_question_answers_question_id_fkey,
ADD CONSTRAINT fk_answers_question
    FOREIGN KEY (question_id)
    REFERENCES content_questions(id)
    ON DELETE CASCADE;


ALTER TABLE question_media
DROP CONSTRAINT question_media_question_id_fkey,
ADD CONSTRAINT fk_question_media_question
    FOREIGN KEY (question_id)
    REFERENCES content_questions(id)
    ON DELETE CASCADE;