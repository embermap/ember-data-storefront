export function initialize(applicationInstance) {
  let shoebox = applicationInstance
    .lookup('service:fastboot')
    .get('shoebox');

  let storefront = applicationInstance.lookup('service:storefront');

  shoebox.put('ember-data-storefront', {
    get queries() {
      return storefront.get('fastbootDataRequests');
    }
  });
}

export default {
  name: 'ember-data-storefront',
  initialize
};
