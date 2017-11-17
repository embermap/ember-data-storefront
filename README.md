# Ember data storefront

A collection of APIs to make working with Ember data easier.

Our opinions:

* Relationship access is always sync
* Relationship fetching is always async with well defined APIs
* No surprises in templates (FOUC, N+1)
* JSON:API backend

## Installation

```
ember install ember-data-storefront
```

## Loadable

With this feature turned on storefront adds a `load()` method to every model. This gives you a clear method for asynchronously loading Ember data relationships.

```js
post.load('comments');
```

You can also use JSON:API's dot notation to load additional related relationships.

```js
post.load('comments.author');
```

Every call to `load()` will return a promise.

```js
post.load('comments').then(() => console.log('loaded comments!'));
```

If a relationship has not loaded the promise will block until the data is loaded. However, if a relationship has already been loaded the promise will not block and perform a background reload. This means you don't have to worry about overcalling `load()`.

This feature works best when used on relationships that are defined with `{ async: false }` because it allows `load()` to load the data, and `get()` to access data that has been loaded.

You can add the `load` API to your models by adding the following code to `app/app.js`.

```js
// app/app.js
import DS from 'ember-data';
import Loadable from 'ember-data-storefront/mixins/loadable';

DS.Model.reopen(Loadable);
```

## Force sync relationships

We're of the opinion that async relationships create a lot of problems. This is because they use a single API that mixes data fetching over the network with local data access. Read [our blog post](https://embermap.com/notes/83-the-case-against-async-relationships) to learn more about our thinking on this topic.

For these reasons, we believe that all relationships should be sync, and we've added a feature that will enforce this by defining `{ async: false }` on every relationship.

To turn this feature on, add this code to `app/app.js`.

```js
// app/app.js
import 'ember-data-storefront/ext/force-sync';
```

Once turned on, you should use `load()` to fetch data and `get()` to access data.

## Must preload

A template-level check in development to assert that a relationship is loaded before rendering a template. This will prevent the template from FOUCing as well as kicking off N+1 queries.

```hbs
{{assert-must-preload post 'comments.author'}}

{{#each post.comments as |comment|}}
  This comment was from {{coment.author.name}}
{{/each}}
```

## Snapshot

**WORK IN PROGRESS**

A way to rollback graph changes to Ember data models.

To turn this feature on you'll need to add the following to `app/app.js`.

```js
// app/app.js
import DS from 'ember-data';
import Snapshottable from 'ember-data-storefront/mixins/snapshottable';

DS.Model.reopen(Snapshottable);
```

API:

```js
let snapshot = post.takeSnapshot({
  author: true,
  comments: {
    author: true
  }
});

post.set('title', 'a new title');
post.set('author.name', 'a new name');
post.set('comments.firstObject.author.name', 'another new name');

// undo all of the above changes
post.restoreSnapshot(snapshot);
```
