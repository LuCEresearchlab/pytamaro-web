-- Add a python mode to code execution events
-- Existing rows default to 'exec' 
CREATE TYPE python_mode_enum AS ENUM ('exec', 'eval-last-expr');
    
ALTER TABLE events_code_execution ADD COLUMN python_mode python_mode_enum NOT NULL DEFAULT 'exec';