import EmberRouter from '@ember/routing/router';
import config from './config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('docs', function () {
    this.route('guides', function () {
      this.route('data-fetching');
      this.route('working-with-relationships');
      this.route('avoiding-errors');
      this.route('fastboot');
      this.route('common-data-issues');
    });

    this.route('api', function () {
      this.route('item', { path: '/*path' });
    });
  });

  this.route('fastboot-tests', function () {
    this.route('load-all-posts');
    this.route('load-record-post', { path: 'load-record-post/:post_id' });
    this.route('find-all-posts');
  });

  this.route('playground');
});
