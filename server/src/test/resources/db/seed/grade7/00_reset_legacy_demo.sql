BEGIN;

DO $$
    DECLARE
        tables_to_clear TEXT;
    BEGIN
        SELECT string_agg(
                       format('%I.%I', schemaname, tablename),
                       ', '
               )
        INTO tables_to_clear
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename <> 'flyway_schema_history';

        IF tables_to_clear IS NOT NULL THEN
            EXECUTE 'TRUNCATE TABLE '
                        || tables_to_clear
                || ' RESTART IDENTITY CASCADE';
        END IF;
    END $$;

COMMIT;