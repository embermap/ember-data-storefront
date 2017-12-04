import Ember from 'ember';
import Service from '@ember/service';
import QuerySet from 'ember-data-storefront/-private/query-set';

export default Service.extend({
  store: Ember.inject.service(),

  init() {
    this._super(...arguments);
    this.set('_cache', {});
  },

  loadAll(type, params = {}) {
    let shouldReload = params.reload;
    delete params.reload;

    let promise;
    let key = this._key(type, params);
    let cache = this.get('_cache');
    let querySet = cache[key];
    let store = this.get('store');

    if (querySet && !shouldReload) {
      promise = Ember.RSVP.resolve(querySet.records);
      querySet.reload(); // background update

    } else if (querySet && shouldReload) {
      promise = querySet.reload();

    } else {
      let querySet = new QuerySet(store, type, params);
      cache[key] = querySet;

      promise = querySet.query();
    }

    return promise;
  },

  _key(type, params) {
    function serializeQuery(params, prefix) {
      const query = Object.keys(params).map((key) => {
        const value  = params[key];

        if (params.constructor === Array) {
          key = `${prefix}[]`;
        } else if (params.constructor === Object) {
          key = (prefix ? `${prefix}[${key}]` : key);
        }

        if (typeof value === 'object') {
          return serializeQuery(value, key);
        } else {
          return `${key}=${encodeURIComponent(value)}`;
        }
      });

      return [].concat.apply([], query).join('&');
    }

    return `${type}:${serializeQuery(params)}`;
  }
});
