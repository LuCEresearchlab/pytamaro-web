CREATE TYPE live_analysis_status AS ENUM ('none', 'syntax', 'syntax-semantics');
    
ALTER TABLE events_code_execution ADD COLUMN live_analysis live_analysis_status NOT NULL DEFAULT 'syntax';
