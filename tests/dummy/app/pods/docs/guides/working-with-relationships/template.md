# Working with relationships

Here are some patterns we recommend to make working with relationships more predictable.

## Explicitly load related data

The `LoadableModel` mixin gives you a simple, expressive way to load related data from your models:

```js
// models/post.js
import DS from 'ember-data';
import LoadableModel from 'ember-data-storefront/mixins/loadable-model';

export default DS.Model.extend(LoadableModel, {
  comments: DS.hasMany()
});
```

Now you have an explicit, expressive API for asynchronously loading related data.

{{docs/guides/working-with-relationships/demo-1}}

## Explicitly reload with related data

The `LoadableModel` mixin also gives you a way to side load related data by reloading your existing loaded models.

{{docs/guides/working-with-relationships/demo-2}}

## Avoiding async relationships

**Why avoid async relationships?**

<aside>
  Read "[The Case against Async Relationships](https://embermap.com/notes/83-the-case-against-async-relationships)" to learn more about our thinking on this topic.
</aside>

We're of the opinion that many data-loading issues can be solved by avoiding async relationships.

Async relationships overload `model.get` to do both remote data fetching and local data access. Since `#get` is typically used everywhere for local data access, we find this mixing of concerns confusing, and instead opt to avoid async relationships altogether.

Sync relationships maintain the expected behavior of `#get` – returning local data – and in combination with our `Loadable` mixin, remote data fetching becomes explicit and local data access stays predictable.

**How to enforce sync-only relationships**

There a few ways you can avoid async relationships:

  - **Use our ESLint plugin.** Follow the instructions and add the `force-sync-relationships` rule from our custom ESLint plugin to your app:

    https://github.com/embermap/eslint-plugin-ember-data-sync-relationships

    You'll see the linting errors in your editor and console, and if you set the rule to `error`, your test suite will fail if any relationships are async.

  - **Use the included Babel plugin to rewrite all relationships to `async: false`.** This is a stronger but less apparent way to enforce sync relationships, so use it with caution.

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

    Now, all "bare" `hasMany` and `belongsTo` calls will be rewritten at build-time to include `{ async: false }` as an option.

    ```js
    export default Model.extend({
      comments: hasMany(),  // async: false
      author: belongsTo(), // async: false
    });
    ```

    If you have a relationship with `async` specified at all (`true` or `false`), the plugin will fail your build. This is to keep relationship definitions as consistent as possible – with only one possible value, the option should be omitted entirely.

    ```js
    export default Model.extend({
      posts: hasMany({ async: true }),  // will fail the build
      posts: hasMany({ async: false }), // will also fail the build
    });
    ```

     In a sense, the `rewrite` option effectively changes the default behavior of `belongsTo` and `hasMany`.
