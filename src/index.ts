class ConcurrentPromise<T extends Promise<any>> {
  promiseFun: () => T;
  callback: (
    e: any,
    promiseRet?: T extends Promise<infer P> ? P : never
  ) => any;

  private stopped = false;
  private maxNumber = 5;
  private currentNumber = 0;
  private stopPromise: Promise<void> | null = null;
  private stopResolver: ((val?: any) => void) | null = null;
  private startResolver: ((val?: any) => void) | null = null;

  constructor(
    promiseFun: ConcurrentPromise<T>["promiseFun"],
    callback: ConcurrentPromise<T>["callback"],
    maxNumber?: number
  ) {
    this.promiseFun = promiseFun;
    this.callback = callback;
    if (maxNumber && maxNumber > 0) {
      this.maxNumber = maxNumber;
    }
  }

  private run() {
    this.currentNumber++;
    this.promiseFun()
      .then((val) => this.callback(null, val))
      .catch((e) => this.callback(e, undefined))
      .finally(() => this.onFinally());
  }

  onFinally() {
    this.currentNumber--;
    if (this.stopped) {
      if (this.currentNumber === 0) {
        // @ts-ignore
        this.stopResolver();
      }
    } else {
      this.run();
    }
  }

  start(): Promise<void> {
    this.stopped = false;
    this.stopResolver = null;
    this.stopPromise = null;
    return new Promise((resolve) => {
      this.startResolver = resolve;
      for (let i = this.currentNumber; i < this.maxNumber; i++) {
        this.run();
      }
    });
  }

  stop() {
    this.stopped = true;

    // 调用 stop 立刻 resolve start
    if (this.startResolver) {
      this.startResolver();
      this.startResolver = null;
    }

    if (!this.stopPromise) {
      this.stopPromise =
        this.currentNumber === 0
          ? Promise.resolve()
          : new Promise((resolve) => {
              this.stopResolver = resolve;
            });
    }
    return this.stopPromise;
  }
}

export default ConcurrentPromise;
