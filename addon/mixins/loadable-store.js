import Mixin from '@ember/object/mixin';
import { deprecate } from '@ember/debug';
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
    `loadRecords` can be used in place of `store.query` to fetch a collection of records for the given type and options.

    ```diff
      this.store
    -   .query('post', { filter: { popular: true } })
    +   .loadRecords('post', { filter: { popular: true } })
        .then(models => models);
    ```

    `loadRecords` caches based on the query you provide, so each of the following examples would return a blocking promise the first time they are called, and instantly resolve from the cache thereafter.

    ```js
    // filters
    store.loadRecords('post', { filter: { popular: true }});

    // pagination
    store.loadRecords('post', { page: { limit: 10, offset: 0 }});

    // includes
    store.loadRecords('post', { include: 'comments' });

    // force an already loaded set to reload (blocking promise)
    store.loadRecords('post', { reload: true });
    ```

    In most cases, `loadRecords` should be a drop-in replacement for `query` that eliminates bugs and improves your app's caching.

    @method loadRecords
    @param {String} type type of model to load
    @param {Object} options (optional) a hash of options
    @return {Promise} a promise resolving with the record array
    @public
  */
  loadRecords(type, options = {}) {
    let query = this.coordinator.recordArrayQueryFor(type, options);
    let shouldBlock = options.reload || !query.value;
    let shouldBackgroundReload =
      options.backgroundReload !== undefined ? options.backgroundReload : true;
    let promise;
    let fetcher;

    if (shouldBlock) {
      promise = query.run();
      fetcher = promise;
    } else {
      promise = resolve(query.value);

      fetcher = shouldBackgroundReload ? query.run() : resolve();
    }

    fetcher.then(() => query.trackIncludes());

    return promise;
  },

  loadAll(...args) {
    deprecate(
      'loadAll has been renamed to loadRecords. Please change all instances of loadAll in your app to loadRecords. loadAll will be removed in 1.0.',
      false,
      { id: 'ember-data-storefront.loadAll', until: '1.0.0' }
    );

    return this.loadRecords(...args);
  },

  /**
    `loadRecord` can be used in place of `store.findRecord` to fetch a single record for the given type, id and options.

    ```diff
      this.store
    -   .findRecord('post', 1, { include: 'comments' })
    +   .loadRecord('post', 1, { include: 'comments' })
        .then(post => post);
    ```

    `loadRecord` caches based on the query you provide, so each of the following examples would return a blocking promise the first time they are called, and synchronously resolve from the cache thereafter.

    ```js
    // simple fetch
    this.store.loadRecord('post', 1);

    // includes
    this.store.loadRecord('post', 1, { include: 'comments' });
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
  loadRecord(type, id, options = {}) {
    let query = this.coordinator.recordQueryFor(type, id, options);
    let shouldBlock = options.reload || !query.value;
    let shouldBackgroundReload =
      options.backgroundReload !== undefined ? options.backgroundReload : true;
    let promise;

    if (shouldBlock) {
      promise = query.run();
    } else {
      promise = resolve(query.value);

      if (shouldBackgroundReload) {
        query.run();
      }
    }

    return promise;
  },

  /**
    _This method relies on JSON:API, and assumes that your server supports JSON:API includes._

    Lets you check whether you've ever loaded related data for a model.

    ```js
    this.store.hasLoadedIncludesForRecord('post', '1', 'comments.author');
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
  },
});
