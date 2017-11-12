Collections

```js
let storefront = this.get('storefront');

// fetching all records
let posts = storefront.all('post');

// reload them
posts.reload(); // returns a promise that will repopulate posts

// get the loaded date
posts.storefront.loadedAt; // javascript date

// fetching a filtered set of records
let popularPosts = storefront.all('post', {
  include: 'comments',
  filter: { popular: true }
});

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
