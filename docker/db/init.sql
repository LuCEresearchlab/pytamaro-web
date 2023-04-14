CREATE TYPE event_kind AS ENUM ('code_execution');

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    user_uuid UUID NOT NULL,
    event_type event_kind NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events_code_execution (
   id INTEGER REFERENCES events(id) PRIMARY KEY,
   docker_image TEXT NOT NULL,
   activity_variant TEXT NOT NULL,
   source TEXT NOT NULL
);