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

  loadAll(type, params={}) {
    let query = this.coordinator.recordArrayQueryFor(type, params);
    let forceReload = params.reload;
    let promise;

    if (forceReload || !query.value) {
      promise = query.run();

    } else {
      promise = resolve(query.value);
      query.run(); // background reload. TODO: swap for expires/stale
    }

    return promise;
  },

  loadRecord(type, id, params={}) {
    let query = this.coordinator.recordQueryFor(type, id, params);
    let forceReload = params.reload;
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
