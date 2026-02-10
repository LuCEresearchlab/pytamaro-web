export class Stack<T> {
  private items: T[];

  constructor() {
    this.items = [];
  }

  push(item: T) {
    this.items.push(item);
  }

  pushInOrder(items: T[]) {
    // The first item in the `items` array should also be the first one popped,
    // so we reverse the order before pushing.
    this.items.push(...items.reverse());
  }

  pop() {
    if (this.isEmpty()) {
      throw Error('Cannot pop from an empty stack');
    }
    return this.items.pop()!;
  }

  isEmpty() {
    return this.items.length === 0;
  }

  findDeepestWhere(predicate: (elem: T) => boolean): T | null {
    return this.items.find(predicate) ?? null;
  }
}
