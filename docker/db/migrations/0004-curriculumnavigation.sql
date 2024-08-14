CREATE TABLE curricula (
    id SERIAL PRIMARY KEY,
    author_slug TEXT NOT NULL,
    curriculum_slug TEXT NOT NULL,
    UNIQUE (author_slug, curriculum_slug)
);

ALTER TYPE event_kind ADD VALUE 'curriculum_navigation';

CREATE TYPE curriculum_navigation_kind AS ENUM ('open_activity', 'next_activity', 'previous_activity');

CREATE TABLE events_curriculum_navigation (
   id INTEGER REFERENCES events(id) PRIMARY KEY,
   navigation_type curriculum_navigation_kind NOT NULL,
   curriculum_id INTEGER REFERENCES curricula(id) NOT NULL,
   activity_id INTEGER REFERENCES activities(id) NOT NULL
);
