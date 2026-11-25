/**
 * Largest file whose content the filesystem hooks copy eagerly.
 */
export const MAX_EAGER_BYTES = 4 * 1024 * 1024;

/**
 * Minimum interval between two content flushes triggered by file writes.
 */
export const WRITE_FLUSH_WINDOW_MS = 50;

/**
 * Minimum interval between incremental workspace scans at draw/size/save FFI
 * points.
 */
export const FFI_SCAN_MIN_INTERVAL_MS = 250;

/**
 * Interval at which the main thread batches mid-run workspace changes before
 * applying them to the IDE.
 */
export const MAIN_BATCH_MS = 50;
