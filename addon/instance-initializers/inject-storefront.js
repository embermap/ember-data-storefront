export function initialize(appInstance) {
  appInstance.inject('route', 'storefront', 'service:storefront');
  appInstance.inject('controller', 'storefront', 'service:storefront');
}

export default {
  name: 'inject-storefront',
  after: 'mixin-storefront',
  initialize,
};
