# Working with relationships

## Loading related data

The `Loadable` mixin gives you an explicit way to load related data. This works best when used in conjunction with all-sync relationships.

## Sync relationships

Many data-loading issues can be solved by avoiding async relationships. In combination with the `Loadable` mixin, remote data fetching becomes explicit and local data access stays predictable.

There a few ways you can avoid async relationships:

  - **Use our ESLint plugin.** Follow the instructions and add the `force-sync-relationships` rule from our custom ESLint plugin to your app:

    https://github.com/embermap/eslint-plugin-ember-data-sync-relationships

    You'll see the linting errors in your editor and console, if you set the rule to `error`, your test suite will fast if any relationships are async.

  - **Use the included Babel plugin to rewrite all relationships to `async: false`.** This is a somewhat stronger but less apparent way to enforce sync relationships.

    In `config/environment.js`, set the `ENV['ember-data-storefront'].forceSyncRelationships` option to `rewrite`:

    ```js
    module.exports = function(environment) {
      let ENV = {
        'ember-data-storefront': {
          forceSyncRelationships: 'rewrite'
        }
      };
    }
    ```

    If you have a relationship with `async` specified at all, whether it's `true` or `false`, the plugin will fail your build.

    ```js
    export default Model.extend({
      posts: hasMany({ async: true }),  // will fail the build
      posts: hasMany({ async: false }), // will also fail the build
    });
    ```

    Otherwise, all `hasMany` and `belongsTo` will be rewritten at build-time to include `{ async: false }` as an option.
