import Mixin from '@ember/object/mixin';
import { resolve } from 'rsvp';
import Coordinator from 'ember-data-storefront/-private/coordinator';

/**
  This mixin that adds new data-loading methods to Ember Data's store.

  It is automatically mixed into your application's store when you install the addon.

  @class LoadableStore
  @public
*/
export default Mixin.create({

  init() {
    this._super(...arguments);

    this.resetCache();
  },

  /**
    `loadAll` can be used in place of `store.findAll` to fetch a collection of records for the given type and options.

    ```diff
      this.get('store')
    -   .findAll('post', { filter: { popular: true } })
    +   .loadAll('post', { filter: { popular: true } })
        .then(models => models);
    ```

    `loadAll` caches based on the query you provide, so each of the following examples would return a blocking promise the first time they are called, and synchronously resolve from the cache thereafter.

    ```js
    // filters
    store.loadAll('post', { filter: { popular: true }});

    // pagination
    store.loadAll('post', { page: { limit: 10, offset: 0 }});

    // includes
    store.loadAll('post', { include: 'comments' });
    ```

    Similar to `store.findAll`, you can force a query to reload using `reload: true`:

    ```
    // force an already loaded set to reload (blocking promise)
    store.loadAll('post', { reload: true });
    ```

    In most cases, `loadAll` should be a drop-in replacement for `findAll` that eliminates bugs and improves your app's caching.

    @method loadAll
    @param {String} type type of model to load
    @param {Object} options (optional) a hash of options
    @return {Promise} a promise resolving with the record array
    @public
  */
  loadAll(type, options={}) {
    let forceReload = options.reload;
    delete options.reload;
    let query = this.coordinator.recordArrayQueryFor(type, options);
    let promise;

    if (forceReload || !query.value) {
      promise = query.run();

    } else {
      promise = resolve(query.value);
      query.run(); // background reload. TODO: swap for expires/stale
    }

    return promise;
  },

  /**
    `loadRecord` can be used in place of `store.findRecord` to fetch a single record for the given type, id and options.

    ```diff
      this.get('store')
    -   .findRecord('post', 1, { include: 'comments' })
    +   .loadRecord('post', 1, { include: 'comments' })
        .then(post => post);
    ```

    `loadRecord` caches based on the query you provide, so each of the following examples would return a blocking promise the first time they are called, and synchronously resolve from the cache thereafter.

    ```js
    // simple fetch
    this.get('store').loadRecord('post', 1);

    // includes
    this.get('store').loadRecord('post', 1, { include: 'comments' });
    ```

    This solves many common bugs where `findRecord` would return immediately, even if important `includes` had never been loaded.

    Similar to `store.findRecord`, you can force a query to reload using `reload: true`:

    ```
    // force an already loaded set to reload (blocking promise)
    store.loadRecord('post', 1, { reload: true });
    ```

    In most cases, `loadRecord` should be a drop-in replacement for `findRecord` that eliminates bugs and improves your app's caching.

    @method loadRecord
    @param {String} type type of model to load
    @param {Number} id id of model to load
    @param {Object} options (optional) a hash of options
    @return {Promise} a promise resolving with the record array
    @public
  */
  loadRecord(type, id, options={}) {
    let query = this.coordinator.recordQueryFor(type, id, options);
    let forceReload = options.reload;
    let promise;

    if (forceReload || !query.value) {
      promise = query.run();

    } else {
      promise = resolve(query.value);
      query.run(); // background reload. TODO: swap for expires/stale
    }

    return promise;
  },

  /**
    _This method relies on JSON:API, and assumes that your server supports JSON:API includes._

    Lets you check whether you've ever loaded related data for a model.

    ```js
    this.get('store').hasLoadedIncludesForRecord('post', '1', 'comments.author');
    ```

    @method hasLoadedIncludesForRecord
    @param {String} type type of model to check
    @param {Number} id id of model to check
    @param {String} includesString a JSON:API includes string representing the relationships to check
    @return {Boolean} whether the includesString has been loaded
    @public
  */
  hasLoadedIncludesForRecord(type, id, includesString) {
    return this.coordinator.recordHasIncludes(type, id, includesString);
  },

  /**
    @method resetCache
    @private
  */
  resetCache() {
    this.coordinator = new Coordinator(this);
  }

});
