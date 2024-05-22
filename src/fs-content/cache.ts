export default class DataCache<T> {
  private elements: Map<string, T>;

  constructor() {
    this.elements = new Map();
  }

  async get(key: string, producer: () => Promise<T>): Promise<T> {
    if (process.env.NODE_ENV === 'development') {
      return producer();
    }
    if (!this.elements.has(key)) {
      this.elements.set(key, await producer());
    }
    return this.elements.get(key) as T;
  }
}
