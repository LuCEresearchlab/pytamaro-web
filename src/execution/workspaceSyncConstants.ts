/**
 * Tuning knobs for live workspace synchronization.
 *
 * The Python worker is synchronous while a program runs: it cannot receive
 * messages and its timers never fire. Liveness therefore comes exclusively from
 * hooks that run inside filesystem operations and from the FFI calls the worker
 * already blocks on (`input`, draw, size, save). These constants bound the cost
 * of those hooks and the rate of messages sent to the main thread.
 */

/**
 * Largest file whose content the filesystem hooks copy eagerly.
 *
 * Copying is synchronous and happens inside a Python syscall. Larger files are
 * left to the scans at FFI points and to the final, authoritative scan, so that
 * a single write cannot stall the program.
 */
export const MAX_EAGER_BYTES = 4 * 1024 * 1024;

/**
 * Minimum interval between two content flushes triggered by file writes.
 *
 * A flush is a leading-edge event: the first write after the window flushes
 * immediately, further writes within the window are coalesced. The `write` hook
 * itself only records the node, so it stays O(1).
 */
export const WRITE_FLUSH_WINDOW_MS = 50;

/**
 * Minimum interval between incremental workspace scans at draw/size/save FFI
 * points.
 *
 * Scans catch what hooks cannot see (mainly files over the size cap). They are
 * incremental, so they cost one `stat` per file plus a read of what changed.
 * `input()` is not throttled: the program is about to block, so correctness
 * (everything the user could expect to see) matters more than the cost.
 */
export const FFI_SCAN_MIN_INTERVAL_MS = 250;

/**
 * Interval at which the main thread batches mid-run workspace changes before
 * applying them to the IDE. Uses `setTimeout`, not `requestAnimationFrame`,
 * because animation frames are paused in background tabs.
 */
export const MAIN_BATCH_MS = 50;
