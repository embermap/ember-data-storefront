import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import { resolve } from 'rsvp';
import { queryCacheKey, shoeboxize } from 'ember-data-storefront/-private/utils/get-key';

/**
  This mixin adds fastboot support to your data adapter. It provides no
  public API, it only needs to be mixed into your adapter.

  ```js
  // app/adpaters/application.js

  import JSONAPIAdapter from 'ember-data/adapters/json-api';
  import FastbootAdapter from 'ember-data-storefront/mixins/fastboot-adapter';

  export default JSONAPIAdapter.extend(
    FastbootAdapter, {

    // ...

  });
  ```

  @class FastbootAdapter
  @public
*/
export default Mixin.create({
  fastboot: service(),

  query(store, type, query) {
    let cachedPayload = this._getStorefrontBoxedQuery(store, type.modelName, query);
    let addToShoebox = this._makeStorefrontQueryBoxer(store, type.modelName, query);

    return cachedPayload ?
      resolve(JSON.parse(cachedPayload)) :
      this._super(...arguments).then(addToShoebox);
  },

  findRecord(store, type, id, snapshot) {
    let query = this.buildQuery(snapshot);

    let cachedPayload = this._getStorefrontBoxedQuery(store, type.modelName, id, query);
    let addToShoebox = this._makeStorefrontQueryBoxer(store, type.modelName, id, query);

    return cachedPayload ?
      resolve(cachedPayload) :
      this._super(...arguments).then(addToShoebox);
  },

  _makeStorefrontQueryBoxer(store, ...args) {
    let fastboot = this.get('fastboot');
    let isFastboot = fastboot && fastboot.get('isFastBoot');

    return function(response) {
      if (isFastboot) {
        let storefrontQuery = store.coordinator.queryFor(...args);
        storefrontQuery._adapterPayload = JSON.stringify(response);
      }

      return response;
    }
  },

  _getStorefrontBoxedQuery(store, ...args) {
    let payload;
    let fastboot = this.get('fastboot');
    let isFastboot = fastboot && fastboot.get('isFastBoot');
    let shoebox = fastboot && fastboot.get('shoebox');
    let box = shoebox && shoebox.retrieve('ember-data-storefront');

    if (!isFastboot && box && box.queries && Object.keys(box.queries).length > 0) {
      let storefrontQuery = store.coordinator.queryFor(...args);
      let key = shoeboxize(queryCacheKey(storefrontQuery));
      payload = box.queries[key];
      delete box.queries[key];
    }

    return payload;
  }

})
