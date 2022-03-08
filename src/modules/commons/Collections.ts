// Pair: 2 values
export class Pair<T1, T2> {
  private v1: T1;
  private v2: T2;

  constructor(v1: T1, v2: T2) {
    this.v1 = v1;
    this.v2 = v2;
  }

  setFirstValue(v: T1): void {
    this.v1 = v;
  }

  setSecondValue(v: T2): void {
    this.v2 = v;
  }

  getFirstValue(): T1 {
    return this.v1;
  }

  getSecondValue(): T2 {
    return this.v2;
  }

  set(v: [T1, T2]): void {
    this.v1 = v[0];
    this.v2 = v[1];
  }

  get(): [T1, T2] {
    return [this.v1, this.v2];
  }
}
