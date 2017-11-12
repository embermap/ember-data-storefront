Collections

```js
let storefront = this.get('storefront');

// returns a promise that resolves with the posts
let loader = storefront.loadAll('post');
let posts = yield storefront.loadAll('post');

// returns a promise that will repopulate posts
let loader2 = posts.reload();

// get the loaded date
posts.storefront.loadedAt; // javascript date

// fetching a filtered set of records
let popularPostsLoader = storefront.loadAll('post', {
  include: 'comments',
  filter: { popular: true }
});

popularPostsLoader.then(popularPosts => ...);

// using the cache for 20 minutes
popularPosts.storefront.expireAt = moment().add(20, 'minutes');

// force a reload, even if data is already in the store
let postsWithComments = storefront.loadAll('post', {
  include: 'comments',
  reload: true
});
```

Records

```js
let storefront = this.get('storefront');

// fetching a record, returns promise that resolves with ds model
let loader = storefront.loadRecord('post', 1);
let post = yield loader;

// get the loaded date
post.storefront.loadedAt; // javascript date

// use ds model reload
post.reload();

// expire the storefront cache
post.storefront.expireAt = moment().add(20, 'minutes');

// load with query params. will return blocking promise since
// we have no loaded with these params
let loader = storefront.loadRecord('post', 1, { include: 'comments' });
let post = yield loader;
```
