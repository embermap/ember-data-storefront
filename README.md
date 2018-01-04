[![Build Status](https://travis-ci.org/EmberMap/ember-data-storefront.svg)](https://travis-ci.org/EmberMap/ember-data-storefront)

# Ember Data Storefront

A collection of APIs to make working with Ember data easier.

Our opinions:

* Relationship access is always sync
* Relationship fetching is always async with well defined APIs
* No surprises in templates (FOUC, N+1)
* JSON:API backend
* Query API that is filter, pagination, and query param aware.

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

## Query API

Storefront contains a service that is similar to Ember Data's store. Under the hood, storefront's Query API is a wrapper around Ember data, so you can always fallback to ED if needed.

By default, storefront's query interface is injected in all routes and controllers. If you would like to use storefront in another Ember object you can inject it as you would any other service.

```js
export default Ember.computed.extend({
  storefront: Ember.service.inject(),

  didInsertElement() {
    this.get('storefront').findAll('post', { filter: { popular: true }});
  }
});
```

The following query APIs are available on the storefront service:

* [findAll](###findAll)


### findAll(modelName, params)

```js
storefront
  .findAll('post', { filter: { popular: true }})
  .then(models => models);
```

Similar to `store.findAll`, `findAll` will query the backend for a collection of models. The first call to `findAll` returns a blocking promise that will fulfill with a collection of models. Subsequent calls to `findAll` with the same model name and params will return a cached result and reloaded the results in the background.

The difference between `findAll` and `store.findAll` is that `store.findAll` will instantly fulfill if any models are in the Ember data store, which can lead to FOUC as well as UI bugs. For example, imagine a user visits the `/posts/1` route, which loads a specific post. Next, they go to the `/posts` route that loads all posts. Since Ember data has a post model (Post Id: 1) in its store, the `store.findAll` in the `/posts` route model hook will instantly fulfill and render the template with a single post. However, since `store.findAll` also triggers a background reload, the page will soon re-render with all posts. This creates a confusing flash of changing content.

`findAll` avoids this problem by returning a blocking promise for any query it has not executed. It will only return an instantly fulfilling promise if it knows it has the expected data in the store.

It also let's you load collections of records using filters, pagination, includes, or any other query string data. Returning a blocking promise for any queries it has never run.

The collection returned by `findAll` is a bound array. It will automatically re-update when the query is re-run in the future.

Whenever `findAll` is returning an instantly fulfilling promise it will also a background reload. If needed, you can force `findAll` to return a blocking promise by adding `{ reload: true }` to the params.

```js
// Examples

// filters
storefront.findAll('post', { filter: { popular: true }});

// pagination
storefront.findAll('post', { page: { limit: 10, offset: 0 }});

// includes
storefront.findAll('post', { include: 'comments' });

// force an already loaded set to reload (blocking promise)
storefront.findAll('post', { reload: true });
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
