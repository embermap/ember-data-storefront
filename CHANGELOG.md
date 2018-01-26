# 0.12

- [ CHANGE ] The `storefront` service has been deprecated. Its methods are now available via the `LoadableStore` mixin which you can use in Ember Data's store. See [the docs](https://embermap.github.io/ember-data-storefront/docs/api/LoadableStore-0.11.1+40effca7) for more.

- [ CHANGE ]The `Loadable` mixin has been renamed to `LoadableModel`. [See the docs](https://embermap.github.io/ember-data-storefront/docs/api/LoadableModel-0.11.1+40effca7).

- [ BREAKING CHANGE ] The force-sync-relationships feature is now implemented as an ESLint warning or Babel plugin. The run-time monkey patch was removed.

    Before:

    ```
    // app/app.js
    import 'ember-data-storefront/ext/force-sync';
    ```

    After:

    ```
    // ember-cli-build.js
    module.exports = function(environment) {
      let ENV = {
        'ember-data-storefront': {
          forceSyncRelationships: 'rewrite'
        }
      };
    }
    ```

# 0.11.0 (Dec 5, 2017)

- Add `loadAll` query API.
- Fix bug with `loadable` not using the correct model name

# 0.10.0 (Nov 10, 2017)

Initial release of storefront. Support for loadable and assert-pre-loaded
