CREATE TABLE sources (
    id SERIAL PRIMARY KEY,
    source TEXT NOT NULL    -- UNIQUE would create a btree index, manually create below a hash one instead
);
CREATE INDEX sources_hash_index ON sources USING hash (source); 

CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    author_slug TEXT NOT NULL,
    activity_slug TEXT NOT NULL,
    language TEXT NOT NULL,
    version TEXT NOT NULL,
    UNIQUE (author_slug, activity_slug, language, version)
);

CREATE TABLE docker_images (
    id SERIAL PRIMARY KEY,
    tag TEXT UNIQUE NOT NULL
);

CREATE TYPE event_kind AS ENUM ('code_execution', 'api_lookup', 'user_feedback');

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    event_type event_kind NOT NULL,
    user_uuid UUID NOT NULL,
    experiment_key TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE events_code_execution (
   id INTEGER REFERENCES events(id) PRIMARY KEY,
   docker_image_id INTEGER REFERENCES docker_images(id) NOT NULL,
   activity_id INTEGER REFERENCES activities(id) NOT NULL,
   requested_cell_seq_number INTEGER NOT NULL,
   cells_to_files_version INTEGER NOT NULL
);

CREATE TABLE code_execution_sources (
   event_id INTEGER REFERENCES events_code_execution(id) NOT NULL,
   cell_seq_number INTEGER NOT NULL,
   source_id INTEGER REFERENCES sources(id) NOT NULL,
   initial_source_id INTEGER REFERENCES sources(id) NOT NULL,
   PRIMARY KEY (event_id, cell_seq_number)
);

CREATE TABLE events_api_lookup (
   id INTEGER REFERENCES events(id) PRIMARY KEY,
   activity_id INTEGER REFERENCES activities(id) NOT NULL,
   name TEXT NOT NULL
);

CREATE TABLE events_user_feedback (
    id INTEGER REFERENCES events(id) PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    pathname TEXT NOT NULL
);
