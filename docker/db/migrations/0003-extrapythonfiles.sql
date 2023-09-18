CREATE TABLE code_execution_extra_python_files (
   event_id INTEGER REFERENCES events_code_execution(id) NOT NULL,
   name TEXT NOT NULL,
   source_id INTEGER REFERENCES sources(id) NOT NULL,
   PRIMARY KEY (event_id, name)
);
