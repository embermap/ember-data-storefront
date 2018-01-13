import EmberRouter from '@ember/routing/router';
import config from './config/environment';
import RouterScroll from 'ember-router-scroll';

const Router = EmberRouter.extend(RouterScroll, {
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
 this.route('docs', function() {
   this.route('quickstart');
   this.route('guides', function() {
     this.route('storefront');
     this.route('expires');
   });

   this.route('api', function() {
     this.route('class', { path: '/:class_id' });
   });
 });
});

export default Router;
