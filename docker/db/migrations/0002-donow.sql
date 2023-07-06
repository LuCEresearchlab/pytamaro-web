ALTER TYPE event_kind ADD VALUE 'do_now_completed';

CREATE TABLE events_do_now_completed (
   id INTEGER REFERENCES events(id) PRIMARY KEY,
   activity_id INTEGER REFERENCES activities(id) NOT NULL,
   do_now_id TEXT NOT NULL,
   answer TEXT NOT NULL
);
