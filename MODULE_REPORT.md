## Module Report
### Unknown Global

**Global**: `Ember.onerror`

**Location**: `tests/integration/components/assert-must-preload-test.js` at line 26

```js
    this.store.resetCache();
    this.server = startMirage();
    onerror = Ember.onerror;
    adapterException = Ember.Test.adapter.exception
    loggerError = Ember.Logger.error;
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/integration/components/assert-must-preload-test.js` at line 27

```js
    this.server = startMirage();
    onerror = Ember.onerror;
    adapterException = Ember.Test.adapter.exception
    loggerError = Ember.Logger.error;

```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/integration/components/assert-must-preload-test.js` at line 28

```js
    onerror = Ember.onerror;
    adapterException = Ember.Test.adapter.exception
    loggerError = Ember.Logger.error;

    // the next line doesn't work in 2.x due to an eslint rule
```

### Unknown Global

**Global**: `Ember.VERSION`

**Location**: `tests/integration/components/assert-must-preload-test.js` at line 32

```js
    // the next line doesn't work in 2.x due to an eslint rule
    // eslint-disable-next-line
    [ this.major, this.minor ] = Ember.VERSION.split(".");
  });

```

### Unknown Global

**Global**: `Ember.onerror`

**Location**: `tests/integration/components/assert-must-preload-test.js` at line 36

```js

  hooks.afterEach(function() {
    Ember.onerror = onerror;
    Ember.Test.adapter.exception = adapterException;
    Ember.Logger.error = loggerError;
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/integration/components/assert-must-preload-test.js` at line 37

```js
  hooks.afterEach(function() {
    Ember.onerror = onerror;
    Ember.Test.adapter.exception = adapterException;
    Ember.Logger.error = loggerError;
    this.server.shutdown();
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/integration/components/assert-must-preload-test.js` at line 38

```js
    Ember.onerror = onerror;
    Ember.Test.adapter.exception = adapterException;
    Ember.Logger.error = loggerError;
    this.server.shutdown();
  });
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/integration/components/assert-must-preload-test.js` at line 54

```js

    if (this.major === "2" && (this.minor === "12" || this.minor === "16")) {
      Ember.Logger.error = function() {};
      Ember.Test.adapter.exception = assertError;
    } else {
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/integration/components/assert-must-preload-test.js` at line 55

```js
    if (this.major === "2" && (this.minor === "12" || this.minor === "16")) {
      Ember.Logger.error = function() {};
      Ember.Test.adapter.exception = assertError;
    } else {
      Ember.onerror = assertError;
```

### Unknown Global

**Global**: `Ember.onerror`

**Location**: `tests/integration/components/assert-must-preload-test.js` at line 57

```js
      Ember.Test.adapter.exception = assertError;
    } else {
      Ember.onerror = assertError;
    }

```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/integration/components/assert-must-preload-test.js` at line 77

```js

    if (this.major === "2" && (this.minor === "12" || this.minor === "16")) {
      Ember.Logger.error = function() {};
      Ember.Test.adapter.exception = assertError;
    } else {
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/integration/components/assert-must-preload-test.js` at line 78

```js
    if (this.major === "2" && (this.minor === "12" || this.minor === "16")) {
      Ember.Logger.error = function() {};
      Ember.Test.adapter.exception = assertError;
    } else {
      Ember.onerror = assertError;
```

### Unknown Global

**Global**: `Ember.onerror`

**Location**: `tests/integration/components/assert-must-preload-test.js` at line 80

```js
      Ember.Test.adapter.exception = assertError;
    } else {
      Ember.onerror = assertError;
    }

```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/integration/components/assert-must-preload-test.js` at line 100

```js

    if (this.major === "2" && (this.minor === "12" || this.minor === "16")) {
      Ember.Logger.error = function() {};
      Ember.Test.adapter.exception = assertError;
    } else {
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/integration/components/assert-must-preload-test.js` at line 101

```js
    if (this.major === "2" && (this.minor === "12" || this.minor === "16")) {
      Ember.Logger.error = function() {};
      Ember.Test.adapter.exception = assertError;
    } else {
      Ember.onerror = assertError;
```

### Unknown Global

**Global**: `Ember.onerror`

**Location**: `tests/integration/components/assert-must-preload-test.js` at line 103

```js
      Ember.Test.adapter.exception = assertError;
    } else {
      Ember.onerror = assertError;
    }

```
