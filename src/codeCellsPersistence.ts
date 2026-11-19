import { debounce } from 'lodash';
import type { CodeCellState } from './localStorage/schema';

export const WRITE_DEBOUNCE_MS = 50;

/** Keeps the cells of one activity in local storage between visits. */
export class LocalStorageCodeCells {
  private lastRaw: string | null = null;
  private readonly write = debounce(
    (cells: CodeCellState[]) => this.writeNow(cells),
    WRITE_DEBOUNCE_MS,
  );

  constructor(private readonly key: string) {}

  private parse(raw: string | null): CodeCellState[] | null {
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as CodeCellState[];
    } catch {
      return null;
    }
  }

  load(): CodeCellState[] | null {
    try {
      this.lastRaw = window.localStorage.getItem(this.key);
      return this.parse(this.lastRaw);
    } catch {
      // Storage access can be denied (e.g., SecurityError). Treat the
      // activity as having no saved cells and keep working in memory.
      this.lastRaw = null;
      return null;
    }
  }

  save(cells: CodeCellState[]) {
    this.write(cells);
  }

  flush() {
    this.write.flush();
  }

  // Reports changes made elsewhere (other tabs); `null` means removed.
  watch(onExternalChange: (cells: CodeCellState[] | null) => void) {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== this.key || event.newValue === this.lastRaw) return;
      const cells = this.parse(event.newValue);
      if (event.newValue !== null && cells === null) return; // corrupt: ignore
      this.lastRaw = event.newValue;
      this.write.cancel();
      onExternalChange(cells);
    };
    const onPageHide = () => this.flush();
    window.addEventListener('storage', onStorage);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('pagehide', onPageHide);
      this.flush();
    };
  }

  private writeNow(cells: CodeCellState[]) {
    const raw = JSON.stringify(cells);
    if (raw === this.lastRaw) return;
    try {
      window.localStorage.setItem(this.key, raw);
      this.lastRaw = raw;
    } catch {
      // Ignore quota errors.
    }
  }
}
