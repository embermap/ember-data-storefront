# Data fetching

Follow these patterns to improve your application's data-fetching story.

## Query-aware caching

Storefront adds some `load` methods to Ember Data's `store` that can be used in place of `findAll`, `query`, and `findRecord`. They're built directly on top of Ember Data, but are more intelligent about caching. Another way to say this is that Storefront's `load` methods are query-aware.

---

Ember Data's `store.findAll` method is used to fetch a collection from your backend. Typically this method will return a blocking promise while the network request is in progress; however, if Ember Data has any local records in its store when `findAll` is called, it will resolve the promise immediately and return everything in its local store, and then trigger a network request in the background. This can lead to unexpected rendering behavior.

In the following example, compare how the app behaves when you visit the routes in a different order:

  - First, visit `/posts`, then visit `/posts/1`.
  - When you're done, reset the app.
  - This time, visit `/posts/1` first and `/posts` second.

{{docs/guides/data-fetching/demo-1}}

If you followed the steps above, what you'll notice is that under the second scenario, the `/posts` route was actually rendered in two states. First, it showed `post:1` in the list, and then after about a second the app re-rendered and the other two posts appeared.

This is because the `/posts/1` route had already loaded the `post:1` record into Ember Data's store. By the time you visited the `/posts` index route, the promise from the store's `findAll` method resolved immediately with that `post:1` record, and then triggered a background reload of the entire `posts` collection. (Click the {{fa-icon 'angle-down'}} above to expand the demo for more details about what's happening as you navigate through the app.)

Ember Data's `findAll` method accepts a `reload` option that we can use to force the promise to block, but then we'd lose the benefits of caching. (Note how after visiting `/posts` for the first time, it's fast on all subsequent visits.)

Storefront's `loadRecords` was designed to avoid re-rendering problems like this. Let's make a change to our routes: we'll replace `store.findAll` with `store.loadRecords`:

```diff
  model() {
-   return this.get('store').findAll('post');
+   return this.get('store').loadRecords('post');
  }

  model() {
-   return this.get('store').findRecord('post', 1);
+   return this.get('store').loadRecord('post', 1);
  }
```

Now let's take a look at our app (be sure to click reset first):

{{docs/guides/data-fetching/demo-2}}

Notice that the behavior for the second scenario has changed. If we visit `/posts/1` first, and then click on `/posts`, we get a blocking promise. Storefront knows you haven't loaded all the `post` models yet, so instead of resolving instantly with the one post you happen to have in the store, it issues a network request for all posts and returns a blocking promise. In this way, you avoid the index route being in a state that you as the developer didn't intend.

Storefront accomplishes this by tracking each query and its results individually. If you had previously been using `findAll` as a way of rendering all models in Ember Data's store, regardless of how they were loaded, then you should be aware that `loadRecords` is not a drop-in replacement for `findAll`.

To correctly replace all calls to `findAll` with `loadRecords` you'll need to also use `store.peekAll`:


```diff
  async model() {
-   return this.get('store').findAll('post');
+   await this.get('store').loadRecords('post');
+   return this.get('store').peekAll('posts');
  }
```

Returning `peekAll` will ensure that the route is aware of any new posts created or loaded since its model hook ran. This matches the behavior of `findAll`, which is to load all posts and then return a live binding to all posts in Ember Data's store.

Philosophically, Storefront's position is that routes (and other data-loading parts of your application) should be as declarative as possible. If you return `findAll('post')` from your route, you are declaring that this route needs a list of all posts in order to render. If your application has never made that network request, then it should block until it has made it for the first time. On subsequent visits, the page will render instantly using the cached value, as you can see by clicking around in the demo above.
