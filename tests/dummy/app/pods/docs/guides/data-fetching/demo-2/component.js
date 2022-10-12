import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import podNames from 'ember-component-css/pod-names';

export default class Demo2Component extends Component {
  @service store;

  @tracked visitedRoutes;
  @tracked isExpanded;

  get serverPosts() {
    return window.server.db.dump().posts;
  }

  get clientPosts() {
    return this.store.peekAll('post');
  }

  get model() {
    return this.visit.last.value;
  }

  get activeRoute() {
    return this.visitedRoutes.lastObject;
  }

  get routes() {
    return {
      '/posts': {
        // BEGIN-SNIPPET demo2-posts-route.js
        // route
        model() {
          return this.store.loadRecords('post');
        },
        // END-SNIPPET
      },
      '/posts/1': {
        // BEGIN-SNIPPET demo2-posts1-route.js
        // route
        model() {
          return this.store.loadRecord('post', 1);
        },
        // END-SNIPPET
      },
    };
  }

  get styleNamespace() {
    return podNames['docs/guides/data-fetching/demo-2'];
  }

  constructor() {
    super(...arguments);
    this.reset();
  }

  @task *visit(routeName) {
    this.visitedRoutes.pushObject(routeName);

    return yield this.routes[routeName].model.call(this);
  }

  @action visitRoute(routeName) {
    if (routeName !== this.activeRoute) {
      this.visit.perform(routeName);
    }
  }

  @action toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }

  @action reset() {
    this.store.unloadAll('post');
    this.store.resetCache();
    this.visitedRoutes = A(['/']);
  }
}
