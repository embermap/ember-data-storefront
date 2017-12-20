import Ember from 'ember';
import Service from '@ember/service';
import Coordinator from 'ember-data-storefront/-private/coordinator';
import { resolve } from 'rsvp';

export default Service.extend({
  store: Ember.inject.service(),

  init() {
    this._super(...arguments);

    this.coordinator = new Coordinator(this.get('store'));
  },

  // loadAll(type, params = {}) {
  //   let shouldReload = params.reload;
  //   delete params.reload;
  //
  //   let promise;
  //   let querySet = this.get('cache').collectionFor(type, params);
  //
  //   if (querySet && !shouldReload) {
  //     promise = Ember.RSVP.resolve(querySet.records);
  //     querySet.reload(); // background reload TODO: swap for expires
  //
  //   } else if (querySet && shouldReload) {
  //     promise = querySet.reload();
  //
  //   } else {
  //     promise = this.fetchAllWithParams(type, params);
  //   }
  //
  //   return DS.PromiseArray.create({ promise });
  // },

  // loadAll(type, params = {}) {
  //   let query = this.cache.queryFor(type, params);
  //   let promise;
  //
  //   promise = query.run();
  //
  //   return promise;
  // },

  loadRecord(type, id, params={}) {
    let query = this.coordinator.queryFor(type, id, params);
    let forceReload = params.reload;
    let promise;

    if (forceReload || !query.value) {
      promise = query.run();

    } else {
      promise = resolve(query.value);
      query.run(); // background reload. TODO: swap for expires/stale
    }

    return promise;
  }

});
