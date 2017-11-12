import Ember from 'ember';
import Service from '@ember/service';

export default Service.extend({
  store: Ember.inject.service(),

  /**
    this.store.loadAll('post', { filter.popular = true })

    this.storefront.all('post', {
      filter: { popular: true },
      include: 'comments'
    });
  */

  all(type, params = {}) {
    let key = this._paramsKey(params);
    let cache = this.get('_cache');

    if (!cache[key]) {
      return this.store.query('type', params)
        .then((results) => {
          results.__storefront = {
            params,
            loadedAt: new Date(),
          };
          results.reload = function() {
            // query and populate the right record array
          };
          cache[key] = results;
          return results;
        });

    } else {
      return Ember.RSVP.resolve(cache[key]);

    }
  },

  find(type, id, params) {

  },

  refresh(result) {
    // if record array

    // if single record

    // if promise?
  },

  _paramsKey(params) {
    return "x";
  }
});
