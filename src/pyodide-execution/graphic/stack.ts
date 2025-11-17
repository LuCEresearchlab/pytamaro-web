type Cons<T> = {
  car: T;
  cdr: Cons<T> | null;
};

export class Stack<T> {
  private head: Cons<T> | null;

  constructor() {
    this.head = null;
  }

  push(value: T) {
    this.head = {
      car: value,
      cdr: this.head,
    };
  }

  pop() {
    if (this.head === null) {
      throw Error('Empty stack');
    }
    const { car, cdr } = this.head;
    this.head = cdr;
    return car;
  }

  isEmpty() {
    return this.head == null;
  }

  latest(predicate: (elem: T) => boolean): T | null {
    let result: T | null = null;
    let itr = this.head;
    while (itr !== null) {
      if (predicate(itr.car)) {
        result = itr.car;
      }
      itr = itr.cdr;
    }
    return result;
  }
}
