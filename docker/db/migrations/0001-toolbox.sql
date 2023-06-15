CREATE TABLE code_execution_toolbox_functions (
   event_id INTEGER REFERENCES events_code_execution(id) NOT NULL,
   name TEXT NOT NULL,
   source_id INTEGER REFERENCES sources(id) NOT NULL,
   PRIMARY KEY (event_id, name)
);

ALTER TYPE event_kind ADD VALUE 'add_toolbox_function';
ALTER TYPE event_kind ADD VALUE 'delete_toolbox_function';

CREATE TABLE events_add_toolbox_function (
   id INTEGER REFERENCES events(id) PRIMARY KEY,
   name TEXT NOT NULL,
   description TEXT NOT NULL,
   source_id INTEGER REFERENCES sources(id) NOT NULL,
   usage_source_id INTEGER REFERENCES sources(id) NOT NULL,
   original_activity_id INTEGER REFERENCES activities(id) NOT NULL
);

CREATE TABLE events_delete_toolbox_function (
   id INTEGER REFERENCES events(id) PRIMARY KEY,
   name TEXT NOT NULL
);