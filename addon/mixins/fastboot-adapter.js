import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import { resolve } from 'rsvp';
import { queryCacheKey, shoeboxize } from 'ember-data-storefront/-private/utils/get-key';

export default Mixin.create({
  fastboot: service(),

  query(store, type, query) {
    let promise;
    let fastboot = this.get('fastboot');
    let isFastboot = fastboot && fastboot.get('isFastBoot');
    let shoebox = fastboot && fastboot.get('shoebox');
    let box = shoebox && shoebox.retrieve('ember-data-storefront');

    if (!isFastboot && box && box.queries && Object.keys(box.queries).length > 0) {
      // running in browser with fastboot box
      let storefrontQuery = store.coordinator.recordArrayQueryFor(type.modelName, query);
      let key = shoeboxize(queryCacheKey(storefrontQuery));
      let json = box.queries[key];

      // if we have the query in the box use it, otherwise call super
      promise = json ? resolve(JSON.parse(json)) : this._super(...arguments);

      // throw the boxed query away so real network requests will
      // happen if the user ever wants to force reload
      delete box.queries[key]

    } else if (!isFastboot) {
      // running on browser, but no box. make a network request
      promise = this._super(...arguments);

    } else {
      // running in fastboot, make a network request and store
      // the payload
      promise = this._super(...arguments)
        .then(response => {
          let storefrontQuery = store.coordinator.recordArrayQueryFor(type.modelName, query);
          storefrontQuery._adapterPayload = JSON.stringify(response);
          return response;
        });

    }

    return promise;
  }

})
