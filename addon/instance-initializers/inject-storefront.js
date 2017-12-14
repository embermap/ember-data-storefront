export function initialize(appInstance) {
  appInstance.inject('route', 'storefront', 'service:storefront');
}

export default {
  initialize
};
