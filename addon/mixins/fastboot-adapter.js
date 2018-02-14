import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import { resolve } from 'rsvp';
import { cacheKey, shoeboxize } from 'ember-data-storefront/-private/utils/get-key';

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
  storefront: service(),

  ajax(url, type, options) {
    let key = shoeboxize(cacheKey([type, url, options.data]));

    let cachedPayload = this._getStorefrontBoxedQuery(key);
    let maybeAddToShoebox = this._makeStorefrontQueryBoxer(key);

    return cachedPayload ?
      resolve(JSON.parse(cachedPayload)) :
      this._super(...arguments).then(maybeAddToShoebox);
  },

  _makeStorefrontQueryBoxer(key) {
    let fastboot = this.get('fastboot');
    let isFastboot = fastboot && fastboot.get('isFastBoot');
    let cache = this.get('storefront.fastbootDataRequests');

    return function(response) {
      if (isFastboot) {
        cache[key] = JSON.stringify(response);
      }

      return response;
    }
  },

  _getStorefrontBoxedQuery(key) {
    let payload;
    let fastboot = this.get('fastboot');
    let isFastboot = fastboot && fastboot.get('isFastBoot');
    let shoebox = fastboot && fastboot.get('shoebox');
    let box = shoebox && shoebox.retrieve('ember-data-storefront');

    if (!isFastboot && box && box.queries && Object.keys(box.queries).length > 0) {
      payload = box.queries[key];
      delete box.queries[key];
    }

    return payload;
  }

})
