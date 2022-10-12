import Mixin from '@ember/object/mixin';
import { deprecate } from '@ember/debug';
import { on } from '@ember/object/evented';
import LoadableModel from './loadable-model';

export default Mixin.create(LoadableModel, {
  showDeprecations: on('init', function () {
    deprecate(
      'The Loadable mixin has been renamed to LoadableMixin. Please change all instances of Loadable in your app to LoadableMixin. Loadable will be removed in 1.0.',
      false,
      { id: 'ember-data-storefront.loadable', until: '1.0.0' }
    );
  }),
});
