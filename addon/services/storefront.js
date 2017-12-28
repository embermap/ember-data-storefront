import Ember from 'ember';
import Service from '@ember/service';
import Coordinator from 'ember-data-storefront/-private/coordinator';
import { resolve } from 'rsvp';

/**
  Storefront's main service builds directly upon Ember Data's `Store`. Under the hood, this service delegates to Ember Data, so you should feel free to fall back to Ember Data's store at any time.

  By default, the `storefront` service is injected into all routes and controllers. If you'd like to use the service in another Ember object, you can inject it as you would any other service:

  ```js
  export default Ember.Component.extend({
    storefront: Ember.service.inject(),

    didInsertElement() {
      this.get('storefront').loadAll('post', { filter: { popular: true }});
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

    this.coordinator = new Coordinator(this.get('store'));
  },

  /**
    Loads the records for the given type and options and returns a promise.

    ```js
    this.get('storefront')
      .loadAll('post', { filter: { popular: true } })
      .then(models => models);
    ```

    Similar to Ember Data's `findAll`, `loadAll` will query the backend for a collection of models. The first call to `loadAll` returns a blocking promise that will fulfill with a collection of models. Subsequent calls to `loadAll` with the same model name and options will return a cached result, and reload the results in the background.

    The difference between loadAll and findAll is that findAll will instantly fulfill if any models are in the Ember data store, which can lead to FOUC as well as UI bugs. For example, imagine a user visits the /posts/1 route, which loads a specific post. Next, they go to the /posts route that loads all posts. Since Ember data has a post model (Post Id: 1) in its store, the findAll in the /posts route model hook will instantly fulfill and render the template with a single post. However, since findAll also triggers a background reload, the page will soon re-render with all posts. This creates a confusing flash of changing content.

    loadAll avoids this problem by returning a blocking promise for any query it has not executed. It will only return an instantly fulfilling promise if it knows it has the expected data in the store.

    It also let's you load collections of records using filters, pagination, includes, or any other query string data. Returning a blocking promise for any queries it has never run.

    The collection returned by loadAll is a bound array. It will automatically re-update when the query is re-run in the future.

    Whenever loadAll is returning an instantly fulfilling promise it will also a background reload. If needed, you can force loadAll to return a blocking promise by adding { reload: true } to the params.

    ```js
    // Examples

    // filters
    storefront.loadAll('post', { filter: { popular: true }});

    // pagination
    storefront.loadAll('post', { page: { limit: 10, offset: 0 }});

    // includes
    storefront.loadAll('post', { include: 'comments' });

    // force an already loaded set to reload (blocking promise)
    storefront.loadAll('post', { reload: true });
    ```

    @method loadAll
    @param {String} type type of model to load
    @param {Object} options (optional) a hash of options
    @return {Promise} a promise resolving with the record array
    @public
  */
  loadAll(type, options={}) {
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

  hasLoadedIncludesForRecord(type, id, includesString) {
    return this.coordinator.recordHasIncludes(type, id, includesString);
  }
});
