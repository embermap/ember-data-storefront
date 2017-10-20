# Ember data storefront

A collection of APIs to make working with Ember data easier.

Our opinions:

* Relationship access is always sync
* Async for data fetching
* No surprises in templates (FOUC, N+1)
* JSON:API backend

This addon is a work in progress...

## Installation

```
ember install ember-data-storefront
```

## Force sync relationships

We're of the opinion that async relationships create a lot of problems. This is because they use a single API that mixes data fetching over the network with local data access.

This makes it hard for developers to express the intent of the code, since network requests are very different thing for data access.

For example, it's not clear exactly what the following snippet is doing.

```
let comments = post.get('comments');
```

It could be making an AJAX request to fetch the posts comments, returning a promise. It could be returning an array of the post's comments and then making a background request to update that array. Or, maybe the developer wrote this line wanting to get the post's comments that were already loaded a few seconds ago by the router, not needing a background refresh at all.

In all these situations the code does not tell us the developer's intentions, which is a problem.

When using async relationships you can easily fall into trap of:

* Calls to `get` trigging a number of AJAX requests.
* Computed properties unknowingly making AJAX requests, turning them into unintentional async computed properties.
* Needing to be aware that `get` of an async relationship should be followed by a `.then`. While this pattern makes sense for data loading, it is confusing to think about when accessing already loaded data.
* Calls to `get('relationship')` returning a PromiseProxy, instead of a model or list of models.

We can avoid all of these problems by sync relationships. That way, whenever we call `post.get('comments')`, we'll always get back an array of posts comments.

Because of this, we believe that all relationships should be sync, and this addon will enforce that by defining `{ async: false }` on every relationship.

To turn this feature on, you'll need to add this code to app.js.

```
// app/app.js
import 'ember-data-storefront/ext/force-sync';
```

In the next section, we'll discuss the APIs that allow this addon to lazily load data on demand.

## Loadable

For loading relationships asynchronously.

To turn this feature on you'll need to add the following to app.js.

```
// app/app.js
import DS from 'ember-data';
import Loadable from 'ember-data-storefront/mixins/loadable';

DS.Model.reopen(Loadable);
```

### model.load('relationship')

### model.hasLoaded('relationship')

## Must preload

A template level check in development to assert that a relationship is loaded before rendering a template. This will prevent the template from FOUCing as well as kicking of N+1 queries.

```
{{assert-must-preload post 'comments.author'}}

{{#each post.comments as |comment|}}
  This comment was from {{coment.author.name}}
{{/each}}
```

## Snapshot

A way to rollback graph changes to Ember data models.

To turn this feature on you'll need to add the following to app.js.

```
// app/app.js
import DS from 'ember-data';
import Snapshottable from 'ember-data-storefront/mixins/snapshottable';

DS.Model.reopen(Snapshottable);
```

API:

```
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
