# Fastboot support

A fastboot rendered application will make data requests on the server in order to generate its HTML. Once the application is delivered to the browser it will re-render itself and make those same data requests that were just made on the server.

This is problematic because the application will now make unnecessary network requests, incorrectly render loading templates, and display flashes of changing content.

In order to avoid these problems you can use the `FastbootAdapter` mixin.

## Applying the mixin

<aside>
  The mixin will only work in applications that use fastboot. Do not
  use this mixin if you are not using fastboot.
</aside>

The mixin should be applied to your application adapter.

```js
// app/adpaters/application.js

import JSONAPIAdapter from 'ember-data/adapters/json-api';
import FastbootAdapter from 'ember-data-storefront/mixins/fastboot-adapter';

export default JSONAPIAdapter.extend(
  FastbootAdapter, {

  // ...

});
```

That's it! Once mixed-in it will prevent your application from making unnecessary data fetches.

## Under the hood

The `FastbootAdapter` works by storing the results of AJAX requests into fastboot's shoebox. When the application is rendered on the client any data request that exists in the shoebox will be used and no network request will be made.

The adapter will delete queries from the shoebox as soon as they are used. This ensures that if your application ever tries to re-make a network request in the future, it will not be served a cached version.

Fastboot rendered pages need to be generated quickly, since they are rendered on the server in an HTTP request-resposne cycle. Because of this, they tend to not make many network requests. This means that a few seconds after the browser re-renders a fastboot page, the query cache should be empty since the client rendered application will have re-fetched all of the fastboot data.
