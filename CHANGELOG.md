# master
- [ BREAKING CHANGE ] The force-sync-relationships feature is now implemented as a Babel plugin rather than a run-time monkey patch.

    Before:

    ```
    // app/app.js
    import 'ember-data-storefront/ext/force-sync';
    ```

    After:

    ```
    // ember-cli-build.js
    ```

# 0.11.0 (Dec 5, 2017)

- Add `loadAll` query API.
- Fix bug with `loadable` not using the correct model name

# 0.10.0 (Nov 10, 2017)

Initial release of storefront. Support for loadable and assert-pre-loaded
