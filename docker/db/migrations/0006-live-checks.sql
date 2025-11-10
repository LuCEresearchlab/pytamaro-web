CREATE TYPE live_checks_status AS ENUM ('none', 'syntax', 'syntax-semantics');
    
ALTER TABLE events_code_execution ADD COLUMN live_checks live_checks_status NOT NULL DEFAULT 'syntax';
