import Mixin from '@ember/object/mixin';

/**
  _This mixin relies on JSON:API, and assumes that your server supports JSON:API includes._

  This mixin adds new data-loading methods to your Ember Data models.

  To use it, extend a model and mix it in:

  ```js
  // app/models/post.js
  import DS from 'ember-data';
  import LoadableModel from 'ember-data-storefront/mixins/loadable-model';

  export default DS.Store.extend(LoadableModel);
  ```

  Once you understand how `LoadableModel` works We suggest adding it to every model in your app. You can do this by reopening `DS.Model` in `app.js.` and mixing it in:

  ```js
  // app/app.js
  import DS from 'ember-data';
  import LoadableModel from 'ember-data-storefront/mixins/loadable-model';

  DS.Model.reopen(LoadableModel);
  ```

  @class LoadableModel
  @public
*/
export default Mixin.create({

   /**
    `load` gives you an explicit way to asynchronously load related data.

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

    @method load
    @param {String} includesString a JSON:API includes string representing the relationships to check
    @return {Promise} a promise resolving with the record
    @public
  */
  load(...includes) {
    let modelName = this.constructor.modelName;

    return this.get('store').loadRecord(modelName, this.get('id'), {
      include: includes.join(',')
    });
  },

  /**
    This method returns true if the provided includes string has been loaded and false if not.

    @method hasLoaded
    @param {String} includesString a JSON:API includes string representing the relationships to check
    @return {Boolean} true if the includes has been loaded, false if not
    @public
  */
  hasLoaded(includesString) {
    let modelName = this.constructor.modelName;

    return this.get('store').hasLoadedIncludesForRecord(modelName, this.get('id'), includesString);
  }

});
