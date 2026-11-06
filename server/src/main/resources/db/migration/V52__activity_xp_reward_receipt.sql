-- Immutable terminal receipt fields. Historical sessions remain null and are
-- deliberately not backfilled or retro-awarded.
ALTER TABLE activity_sessions
    ADD COLUMN xp_lifetime_after BIGINT,
    ADD COLUMN xp_level_after INTEGER,
    ADD CONSTRAINT ck_activity_session_xp_lifetime_after
        CHECK (xp_lifetime_after IS NULL OR xp_lifetime_after >= 0),
    ADD CONSTRAINT ck_activity_session_xp_level_after
        CHECK (xp_level_after IS NULL OR xp_level_after >= 1);
