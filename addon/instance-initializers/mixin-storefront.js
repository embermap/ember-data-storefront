import LoadableStore from 'ember-data-storefront/mixins/loadable-store';

export function initialize(appInstance) {
  let store = appInstance.lookup('service:store');
  store.reopen(LoadableStore);
  store.resetCache();
}

export default {
  name: 'mixin-storefront',
  after: 'ember-data',
  initialize,
};
