-- Add an execution UUID to code execution events
-- Randomly generate for the existing rows, make it mandatory without a default for new rows
ALTER TABLE events_code_execution ADD COLUMN execution_uuid UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE events_code_execution ALTER COLUMN execution_uuid DROP DEFAULT;


-- Keep track of user input
ALTER TYPE event_kind ADD VALUE 'code_execution_input';

CREATE TABLE events_code_execution_input (
   id INTEGER REFERENCES events(id) PRIMARY KEY,
   execution_uuid UUID NOT NULL, -- ideally this would be a foreign key, but we want to allow possible out-of-order insertions 
   seq INTEGER NOT NULL,
   content TEXT NOT NULL,
   UNIQUE (execution_uuid, seq)
);


-- Keep track of interactions with the execution warning dialog when there are errors
ALTER TYPE event_kind ADD VALUE 'code_execution_errors_warning';

CREATE TABLE events_code_execution_errors_warning (
   id INTEGER REFERENCES events(id) PRIMARY KEY,
   execution_uuid UUID NOT NULL UNIQUE, -- ideally this would be a foreign key, but we want to allow possible out-of-order insertions
   forced_execution BOOLEAN NOT NULL
);
