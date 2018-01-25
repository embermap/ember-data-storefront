import Ember from 'ember';
import Service from '@ember/service';
import Coordinator from 'ember-data-storefront/-private/coordinator';
import { resolve } from 'rsvp';
import { deprecate } from '@ember/application/deprecations';

/**
  Storefront's main service builds directly upon Ember Data's `Store`. Under the hood, this service delegates to Ember Data, so you should feel free to fall back to Ember Data's store at any time.

  By default, the `storefront` service is injected into all routes and controllers. If you'd like to use the service in another Ember object, you can inject it as you would any other service:

  ```js
  export default Ember.Component.extend({
    storefront: Ember.service.inject(),

    didInsertElement() {
      this.get('storefront').findAll('post', { filter: { popular: true }});
    }
  });
  ```

  @class Storefront
  @public
*/
export default Service.extend({
  store: Ember.inject.service(),

  init() {
    this._super(...arguments);

    this.resetCache();
  },

  /**
    Finds the records for the given type and options and returns a promise.

    ```js
    this.get('storefront')
      .findAll('post', { filter: { popular: true } })
      .then(models => models);
    ```

    Here are some more examples:

    ```js
    // filters
    storefront.findAll('post', { filter: { popular: true }});

    // pagination
    storefront.findAll('post', { page: { limit: 10, offset: 0 }});

    // includes
    storefront.findAll('post', { include: 'comments' });

    // force an already loaded set to reload (blocking promise)
    storefront.findAll('post', { reload: true });
    ```

    @method findAll
    @param {String} type type of model to load
    @param {Object} options (optional) a hash of options
    @return {Promise} a promise resolving with the record array
    @public
  */
  findAll(type, options={}) {
    let query = this.coordinator.recordArrayQueryFor(type, options);
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

  loadAll(...args) {
    deprecate(
      'storefront.loadAll has been deprecated, please use storefront.findAll instead. Will be removed in 1.0.',
      false,
      { id: 'ember-data-storefront.storefront-load-all', until: '1.0.0' }
    );
    return this.findAll(...args);
  },

  /**
    Finds a single record for the given type-id pair and options, and returns a promise.

    ```js
    this.get('storefront')
      .findRecord('post', 1, { include: 'comments' })
      .then(post => post);
    ```

    `#findRecord` is query-aware, meaning the following two calls to `findRecord` are different:

    ```js
    this.get('storefront').findRecord('post', 1);
    this.get('storefront').findRecord('post', 1, { include: 'comments' });
    ```

    If either query has never been run before, it will return a blocking promise. Otherwise,
    it will synchronously return the previous value from Storefront's cache.

    @method findRecord
    @param {String} type type of model to load
    @param {Number} id id of model to load
    @param {Object} options (optional) a hash of options
    @return {Promise} a promise resolving with the record array
    @public
  */
  findRecord(type, id, options={}) {
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

  loadRecord(...args) {
    deprecate(
      'storefront.loadRecord has been deprecated, please use storefront.findRecord instead. Will be removed in 1.0.',
      false,
      { id: 'ember-data-storefront.storefront-load-record', until: '1.0.0' }
    );
    return this.findRecord(...args);
  },

  /**
    _This method relies on JSON:API, and assumes that your server supports JSON:API includes._

    This method allows you to check whether Storefront has ever loaded related data for a model.

    ```js
    this.get('storefront')
      .hasLoadedIncludesForRecord('post', '1', 'comments.author');
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

  resetCache() {
    this.coordinator = new Coordinator(this.get('store'));
  }

});
