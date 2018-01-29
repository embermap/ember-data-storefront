import EmberRouter from '@ember/routing/router';
import config from './config/environment';
import RouterScroll from 'ember-router-scroll';

const Router = EmberRouter.extend(RouterScroll, {
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('docs', function() {
    this.route('guides', function() {
      this.route('data-fetching');
      this.route('working-with-relationships');
      this.route('avoiding-errors');
      /*
        - Querying data
          - Storefront's loadAll and loadRecord are cached at the query-level.
        - Relationships
          - Loading related data. `#loadable` gives you an explicit way to load related data (.get is not explicit). This works best with sync relationships.
          - Sync relationships
        - Avoiding errors
          - assert-must-preload
          - Sync relationships are the best way we've found to avoiding templating errors
          - hasLoaded
      */
    });

    this.route('api', function() {
      this.route('class', { path: '/:class_id' });
    });
  });
});

export default Router;
