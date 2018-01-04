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

  hasLoadedIncludesForRecord(type, id, includesString) {
    return this.coordinator.recordHasIncludes(type, id, includesString);
  },

  resetCache() {
    this.coordinator = new Coordinator(this.get('store'));
  }

});
