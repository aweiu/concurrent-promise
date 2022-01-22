## ConcurrentPromise

A ts-type friendly promise Library —— Concurrent your promise!

### Install

```
npm install concurrent-promise
```

### Demo

```javascript
import ConcurrentPromise from "concurrent-promise";

function test() {
  return new Promise((resolve) =>
    setTimeout(() => resolve("ConcurrentPromise"), 3000)
  );
}

const cp = new ConcurrentPromise(
  test,
  (e, ret) => {
    // you will see three times three times...「ConcurrentPromise」
    console.log(ret);

    if (e) {
      cp.stop().then(() => console.log("really stopped"));
    }
  },
  3 // maxConcurrentNumber. default: 5
);

cp.start().then(() => {
  // Once stop is called, it will come here
});
```

### Related

[A ts-type friendly promise Library —— Synchronize your promise!](https://github.com/aweiu/synchronize-promise)
