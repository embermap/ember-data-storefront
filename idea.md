Collections

```js
let storefront = this.get('storefront');

// fetching all records
let loader = storefront.all('post');
let posts = yield storefront.all('post'); // resolves with the posts

// reload them
let loader2 = posts.reload(); // returns a promise that will repopulate posts

// get the loaded date
posts.storefront.loadedAt; // javascript date

// fetching a filtered set of records
let popularPostsLoader = storefront.all('post', {
  include: 'comments',
  filter: { popular: true }
});

popularPostsLoader.then(posts => ...

// using the cache for 20 minutes
popularPosts.storefront.expireAt = moment().add(20, 'minutes');

// force a reload, even if data is already in the store
let postsWithComments = storefront.all('post', {
  include: 'comments',
  reload: true
});
```

Records

```js
let storefront = this.get('storefront');

// fetching a record, returns promise that resolves with ds model
let post = storefront.find('post', 1);

// get the loaded date
post.storefront.loadedAt; // javascript date

// use ds model reload
post.reload();

// expire the storefront cache
post.storefront.expireAt = moment().add(20, 'minutes');

// skip the cache (shouldnt be needed between find and loads api)
storefront.find('post', 1, {
  include: 'comments',
  reload: true
});
```
