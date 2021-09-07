import Component from '@glimmer/component';
import { computed } from '@ember/object';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { readOnly } from '@ember/object/computed';
import { A } from '@ember/array';
import { action } from '@ember/object';

export default class Demo1Component extends Component {
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
        // BEGIN-SNIPPET demo1-posts-route.js
        // route
        model() {
          return this.store.findAll('post');
        },
        // END-SNIPPET
      },
      '/posts/1': {
        // BEGIN-SNIPPET demo1-posts1-route.js
        // route
        model() {
          return this.store.findRecord('post', 1);
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
    if (routeName !== this.get('activeRoute')) {
      this.get('visit').perform(routeName);
    }
  }

  @action toggleExpand() {
    this.toggleProperty('isExpanded');
  }

  @action reset() {
    this.reset();
  }
}
