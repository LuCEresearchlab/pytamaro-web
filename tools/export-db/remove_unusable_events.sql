-- Utility SQL script to delete from a full database dump
-- events created before 2025-12-11, which cannot be used.
-- It also deletes lots (all?) associated information, with an eye on performance.

BEGIN;

-- Find ids of events to delete
CREATE TEMP TABLE ids_old_events ON COMMIT DROP AS
SELECT id
FROM events
WHERE created_at < '2025-12-11';

-- Delete "deep" code execution dependencies
DELETE FROM code_execution_sources ces
USING events_code_execution ece
WHERE ces.event_id = ece.id
  AND ece.id IN (SELECT id FROM ids_old_events);

DELETE FROM code_execution_toolbox_functions cetf
USING events_code_execution ece
WHERE cetf.event_id = ece.id
  AND ece.id IN (SELECT id FROM ids_old_events);

DELETE FROM code_execution_extra_python_files ceepf
USING events_code_execution ece
WHERE ceepf.event_id = ece.id
  AND ece.id IN (SELECT id FROM ids_old_events);

-- Delete direct children of events
DELETE FROM events_do_now_completed
WHERE id IN (SELECT id FROM ids_old_events);

DELETE FROM events_add_toolbox_function
WHERE id IN (SELECT id FROM ids_old_events);

DELETE FROM events_delete_toolbox_function
WHERE id IN (SELECT id FROM ids_old_events);

DELETE FROM events_curriculum_navigation
WHERE id IN (SELECT id FROM ids_old_events);

DELETE FROM events_api_lookup
WHERE id IN (SELECT id FROM ids_old_events);

DELETE FROM events_user_feedback
WHERE id IN (SELECT id FROM ids_old_events);

-- Delete code executions
DELETE FROM events_code_execution
WHERE id IN (SELECT id FROM ids_old_events);

-- Delete events
DELETE FROM events
WHERE id IN (SELECT id FROM ids_old_events);

-- We also want to delete sources (which are not descendants of events, but are indirectly linked to them).
-- We need to be careful, however, because the sources table is huge and DELETE can be impossibly slow (~1 minute per 1000 rows to delete).
-- Step 1: Create a concrete list of IDs to keep
CREATE TEMPORARY TABLE keep_list AS
SELECT source_id AS id FROM code_execution_sources WHERE source_id IS NOT NULL
UNION
SELECT initial_source_id FROM code_execution_sources WHERE initial_source_id IS NOT NULL
UNION
SELECT source_id FROM code_execution_toolbox_functions WHERE source_id IS NOT NULL
UNION
SELECT source_id FROM events_add_toolbox_function WHERE source_id IS NOT NULL
UNION
SELECT usage_source_id FROM events_add_toolbox_function WHERE usage_source_id IS NOT NULL
UNION
SELECT source_id FROM code_execution_extra_python_files WHERE source_id IS NOT NULL;


-- Step 2: Ensure that foreign keys to sources are indexed, otherwise the deletion of rows in sources is impossibly slow.
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        -- Find all Foreign Keys pointing to 'sources' that don't have an index
        SELECT
            c.conrelid::regclass AS child_table,
            a.attname AS child_column,
            'idx_' || c.conrelid::regclass || '_' || a.attname AS index_name
        FROM pg_constraint c
        JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
        -- Check if an index already exists for this column
        LEFT JOIN pg_index ix ON ix.indrelid = c.conrelid AND a.attnum = ANY(ix.indkey)
        WHERE c.contype = 'f' 
          AND c.confrelid = 'sources'::regclass
          AND ix.indrelid IS NULL
    ) LOOP
        -- Log the action
        RAISE NOTICE 'Creating index % on % (%)', r.index_name, r.child_table, r.child_column;
        
        -- Execute the creation
        EXECUTE format('CREATE INDEX %I ON %I (%I)', r.index_name, r.child_table, r.child_column);
    END LOOP;
END $$;

DELETE FROM sources
WHERE id NOT IN (SELECT id FROM keep_list);

COMMIT;