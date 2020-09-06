import JSONAPIAdapter from '@ember-data/adapter/json-api';
import FastbootAdapter from 'ember-data-storefront/mixins/fastboot-adapter';

export default JSONAPIAdapter.extend(
  FastbootAdapter, {

  // namespace: 'foo'

});
