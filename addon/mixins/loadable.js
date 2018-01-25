import Ember from 'ember';

/**
  _This feature relies on JSON:API, and assumes that your server supports JSON:API includes._

  This mixin adds a `#load` method to your Ember Data models.

  ```js
  // models/post.js
  import DS from 'ember-data';
  import Loadable from 'ember-data-storefront/mixins/loadable';

  export default DS.Model.extend(Loadable, {
    comments: DS.hasMany()
  });
  ```

  `#load` gives you an explicit way to asynchronously load related data:

  ```js
  post.load('comments');
  ```

  The above uses Storefront's `loadRecord` method to query your backend for the post along with its comments.

  You can also use JSON:API's dot notation to load additional related relationships.

  ```js
  post.load('comments.author');
  ```

  Every call to `load()` will return a promise.

  ```js
  post.load('comments').then(() => console.log('loaded comments!'));
  ```

  If a relationship has never been loaded, the promise will block until the data is loaded. However, if a relationship has already been loaded (even from calls to `loadRecord` elsewhere in your application), the promise will resolve synchronously with the data from Storefront's cache. This means you don't have to worry about overcalling `load()`.

  This feature works best when used on relationships that are defined with `{ async: false }` because it allows `load()` to load the data, and `get()` to access the data that has already been loaded.

  We suggest adding the `#load` API to every model in your app. To do so, reopen `DS.Model` in `app.js.` and mix in `Loadable`:

  ```js
  // app/app.js
  import DS from 'ember-data';
  import Loadable from 'ember-data-storefront/mixins/loadable';

  DS.Model.reopen(Loadable);
  ```

  @class Loadable
  @public
*/
export default Ember.Mixin.create({

  storefront: Ember.inject.service(),

  load(...includes) {
    let modelName = this.constructor.modelName;

    return this.get('storefront').findRecord(modelName, this.get('id'), {
      include: includes.join(',')
    });
  },

  hasLoaded(includesString) {
    let modelName = this.constructor.modelName;

    return this.get('storefront').hasLoadedIncludesForRecord(modelName, this.get('id'), includesString);
  }

});
