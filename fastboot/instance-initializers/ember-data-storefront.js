import { queryCacheKey, shoeboxize } from 'ember-data-storefront/-private/utils/get-key';

export function initialize(applicationInstance) {
  let shoebox = applicationInstance
    .lookup('service:fastboot')
    .get('shoebox');

  let store = applicationInstance.lookup('service:store');

  shoebox.put('ember-data-storefront', {
    get queries() {
      return store.coordinator
        .dump()
        .filter(query => query._adapterPayload)
        .reduce((result, query) => {
          let key = shoeboxize(queryCacheKey(query));
          result[key] = query._adapterPayload;
          return result;
        }, {});
    }
  });
}

export default {
  name: 'ember-data-storefront',
  initialize
};
