import Ember from 'ember';
import DS from 'ember-data';
import Service from '@ember/service';
import QuerySet from 'ember-data-storefront/-private/query-set';
import Cache from 'ember-data-storefront/-private/cache';
import { resolve } from 'rsvp';

export default Service.extend({
  store: Ember.inject.service(),

  init() {
    this._super(...arguments);

    this.cache = new Cache(this.get('store'));
  },

  loadAll(type, params = {}) {
    let shouldReload = params.reload;
    delete params.reload;

    let promise;
    let querySet = this.get('cache').collectionFor(type, params);

    if (querySet && !shouldReload) {
      promise = Ember.RSVP.resolve(querySet.records);
      querySet.reload(); // background reload TODO: swap for expires

    } else if (querySet && shouldReload) {
      promise = querySet.reload();

    } else {
      promise = this.fetchAllWithParams(type, params);
    }

    return DS.PromiseArray.create({ promise });
  },

  // loadRecord(type, id, params = {}) {
  //   let record = this.get('cache').recordFor(type, id, params);
  //   let promise;
  //
  //   if (record) {
  //     promise = Ember.RSVP.resolve(record);
  //     this.fetchRecordWithParams(type, id, params); // background reload TODO: swap for expires
  //
  //   } else {
  //     promise = this.fetchRecordWithParams(type, id, params);
  //   }
  //
  //   return promise;
  // },

  loadRecord(type, id, params = {}) {
    let query = this.cache.queryFor(type, id, params);
    let promise;

    if (query.value) {
      promise = resolve(query.value);
      query.run(); // background reload TODO: swap for expires/stale

    } else {
      promise = query.run();
    }

    return promise;
  },

  fetchAllWithParams(type, params) {
    let querySet = new QuerySet(this.get('store'), type, params);
    let cache = this.get('cache');

    return querySet
      .query()
      .then(collection => {
        cache.putCollectionFor(type, params, querySet);

        return collection;
      });
  },

  fetchRecordWithParams(type, id, params) {
    let options = Object.assign({ reload: true }, params);
    let cache = this.get('cache');

    return this.get('store')
      .findRecord(type, id, options)
      .then(record => {
        cache.putRecordFor(type, id, params);

        return record;
      });
  },


});
