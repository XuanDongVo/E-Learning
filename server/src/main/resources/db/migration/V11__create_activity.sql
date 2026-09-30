
-- ACTIVITIES
CREATE TABLE activities (
                            id BIGSERIAL PRIMARY KEY,

                            topic_id BIGINT NOT NULL,

                            name VARCHAR(150) NOT NULL,
                            description VARCHAR(1000),

                            status VARCHAR(20) NOT NULL,

                            distribution_mode VARCHAR(20) NOT NULL,

                            total_questions INT NOT NULL,

                            selection_strategy VARCHAR(30) NOT NULL,

                            mode VARCHAR(20) NOT NULL,

                            time_limit_seconds INT,

                            lives INT,

                            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            published_at TIMESTAMP,


                            CONSTRAINT fk_activity_topic
                                FOREIGN KEY (topic_id)
                                    REFERENCES content_topics(id),


                            CONSTRAINT uk_activity_topic_name
                                UNIQUE (topic_id, name),

                            CONSTRAINT ck_activity_status
                                CHECK (status IN (
                                                  'DRAFT',
                                                  'PUBLISHED',
                                                  'ARCHIVED'
                                    )),

                            CONSTRAINT ck_activity_distribution_mode
                                CHECK (distribution_mode IN (
                                                             'EQUAL',
                                                             'PERCENTAGE',
                                                             'FIXED_COUNT'
                                    )),

                            CONSTRAINT ck_activity_selection_strategy
                                CHECK (selection_strategy IN (
                                                              'RANDOM',
                                                              'WEAKNESS_PRIORITY'
                                    )),

                            CONSTRAINT ck_activity_mode
                                CHECK (mode IN (
                                                'LEARNING',
                                                'TRY_HARD',
                                               'BOTH'
                                    )),

                            CONSTRAINT ck_activity_total_questions
                                CHECK (total_questions > 0),

                            CONSTRAINT ck_activity_time_limit
                                CHECK (
                                    time_limit_seconds IS NULL
                                        OR time_limit_seconds > 0
                                    ),

                            CONSTRAINT ck_activity_lives
                                CHECK (
                                    lives IS NULL
                                        OR lives > 0
                                    )
);


CREATE INDEX idx_activities_topic
    ON activities(topic_id);

CREATE INDEX idx_activities_status
    ON activities(status);

CREATE INDEX idx_activities_updated
    ON activities(updated_at DESC);


-- =========================================================
-- ACTIVITY BANKS
-- =========================================================

CREATE TABLE activity_banks (
                                id BIGSERIAL PRIMARY KEY,

                                activity_id BIGINT NOT NULL,
                                question_bank_id BIGINT NOT NULL,

                                display_order INT NOT NULL,

                                percentage INT,
                                fixed_count INT,

                                CONSTRAINT fk_activity_bank_activity
                                    FOREIGN KEY (activity_id)
                                        REFERENCES activities(id)
                                        ON DELETE CASCADE,

                                CONSTRAINT fk_activity_bank_question_bank
                                    FOREIGN KEY (question_bank_id)
                                        REFERENCES content_question_banks(id),

                                CONSTRAINT uk_activity_bank_source
                                    UNIQUE (activity_id, question_bank_id),

                                CONSTRAINT ck_activity_bank_display_order
                                    CHECK (display_order >= 0),

                                CONSTRAINT ck_activity_bank_percentage
                                    CHECK (
                                        percentage IS NULL
                                            OR percentage > 0
                                        ),

                                CONSTRAINT ck_activity_bank_fixed_count
                                    CHECK (
                                        fixed_count IS NULL
                                            OR fixed_count > 0
                                        ),

                                CONSTRAINT ck_activity_bank_allocation_mode
                                    CHECK (
                                        NOT (
                                            percentage IS NOT NULL
                                                AND fixed_count IS NOT NULL
                                            )
                                        )
);


CREATE INDEX idx_activity_banks_activity
    ON activity_banks(activity_id, display_order);

CREATE INDEX idx_activity_banks_question_bank
    ON activity_banks(question_bank_id);