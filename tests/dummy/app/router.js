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
      this.route('fastboot');
    });

    this.route('api', function() {
      this.route('class', { path: '/:class_id' });
    });
  });

  this.route('fastboot-tests', function() {
    this.route('load-all-posts');
    this.route('load-record-post', { path: 'load-record-post/:post_id' });
    this.route('find-all-posts');
  });
});

export default Router;
