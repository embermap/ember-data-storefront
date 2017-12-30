# Quickstart

Here's a quick overview of the features you get after installing Storefront.

**The Storefront service**

The main `storefront` service will be injected into all of your routes. This service exposes the methods `findRecord` and `findAll` which you can use as drop-in replacements for their Ember Data equivalents:

```diff
- return this.get('store').findAll('post'); // or store.query
+ return this.get('storefront').findAll('post');

- return this.get('store').findRecord('post', 1);
+ return this.get('storefront').findRecord('post', 1);
```

Under the hood, these methods delegate to Ember Data, but they're more intelligent about caching. For example, Ember Data's `findRecord` method will resolve immediately with a local record even if it is being called with certain `includes` for the first time, which can put your UI in an unexpected state. Storefront remembers all the options you pass to `findAll` and `findRecord` and ensures a call to one of these methods will immediately resolve only if all the required data has been loaded.

See the [service guide]() to learn more.

**Loading relationships**
