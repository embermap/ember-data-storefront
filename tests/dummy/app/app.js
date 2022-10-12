import Model from '@ember-data/model';
import Application from '@ember/application';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';
import LoadableModel from 'ember-data-storefront/mixins/loadable-model';
import { registerWarnHandler } from '@ember/debug';

Model.reopen(LoadableModel);

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

// We'll ignore the empty tag name warning for test selectors since we have
// empty tag names for pass through components.
registerWarnHandler(function (message, { id }, next) {
  if (id !== 'ember-test-selectors.empty-tag-name') {
    next(...arguments);
  }
});

loadInitializers(App, config.modulePrefix);
