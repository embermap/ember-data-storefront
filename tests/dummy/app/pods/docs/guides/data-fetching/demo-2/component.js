import Component from '@ember/component';
import { computed } from '@ember/object';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { readOnly } from '@ember/object/computed';
import { A } from '@ember/array';
import { action } from '@ember/object';

export default class Demo2Component extends Component {
  @service store;

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

  constructor() {
    super(...arguments);
    this.reset();
  }

  @task *visit(routeName) {
    this.visitedRoutes.pushObject(routeName);

    return yield this.routes[routeName].model.call(this);
  }

  reset() {
    this.store.unloadAll('post');
    this.store.resetCache();
    this.visitedRoutes = A(['/']);
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
    this.reset();
  }
}
