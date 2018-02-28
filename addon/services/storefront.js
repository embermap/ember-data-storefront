import Service, { inject as service } from '@ember/service';
import { deprecate } from '@ember/application/deprecations';

// do not delete this service! it's being used to communicte cached payloads
// between the client and the browser
export default Service.extend({
  store: service(),

  fastbootDataRequests: null,

  init() {
    this._super(...arguments);
    this.set('fastbootDataRequests', {});
  },

  findAll() {
    deprecate(
      'The storefront service has been deprecated, please use store.loadAll instead. Will be removed in 1.0.',
      false,
      { id: 'ember-data-storefront.storefront-find-all', until: '1.0.0' }
    );

    return this.get('store').loadAll(...arguments);
  },

  loadAll() {
    deprecate(
      'The storefront service has been deprecated, please use store.loadAll instead. Will be removed in 1.0.',
      false,
      { id: 'ember-data-storefront.storefront-load-all', until: '1.0.0' }
    );

    return this.get('store').loadAll(...arguments);
  },

  findRecord() {
    deprecate(
      'The storefront service has been deprecated, please use store.loadRecord instead. Will be removed in 1.0.',
      false,
      { id: 'ember-data-storefront.storefront-find-record', until: '1.0.0' }
    );

    return this.get('store').findRecord(...arguments);
  },

  loadRecord() {
    deprecate(
      'The storefront service has been deprecated, please use store.loadRecord instead. Will be removed in 1.0.',
      false,
      { id: 'ember-data-storefront.storefront-load-record', until: '1.0.0' }
    );

    return this.get('store').findRecord(...arguments);
  },

  hasLoadedIncludesForRecord() {
    deprecate(
      'The storefront service has been deprecated, please use store.hasLoadedIncludesForRecord instead. Will be removed in 1.0.',
      false,
      { id: 'ember-data-storefront.storefront-has-loaded-includes-for-record', until: '1.0.0' }
    );

    return this.get('store').hasLoadedIncludesForRecord(...arguments);
  },

  resetCache() {
    deprecate(
      'The storefront service has been deprecated, please use store.resetCache instead. Will be removed in 1.0.',
      false,
      { id: 'ember-data-storefront.storefront-reset-cache', until: '1.0.0' }
    );

    return this.get('store').resetCache(...arguments);
  }

});
