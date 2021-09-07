import Component from '@ember/component';
import { computed } from '@ember/object';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { readOnly } from '@ember/object/computed';
import { A } from '@ember/array';

export default Component.extend({

  store: service(),

  get serverPosts() {
    return window.server.db.dump().posts;
  },

  clientPosts: computed(function() {
    return this.store.peekAll('post');
  }),

  model: readOnly('visit.last.value'),
  activeRoute: readOnly('visitedRoutes.lastObject'),

  routes: computed(function() {
    return {
      '/posts': {
        // BEGIN-SNIPPET demo1-posts-route.js
        // route
        model() {
          return this.store.findAll('post');
        }
        // END-SNIPPET
      },
      '/posts/1': {
        // BEGIN-SNIPPET demo1-posts1-route.js
        // route
        model() {
          return this.store.findRecord('post', 1);
        }
        // END-SNIPPET
      }
    };
  }),

  didInsertElement() {
    this._super(...arguments);
    this.reset();
  },

  visit: task(function * (routeName) {
    this.get('visitedRoutes').pushObject(routeName);

    return yield this.get(`routes.${routeName}.model`).call(this);
  }),

  reset() {
    this.store.unloadAll('post');
    this.store.resetCache();
    this.set('visitedRoutes', A([ '/' ]));
  },

  actions: {
    visitRoute(routeName) {
      if (routeName !== this.get('activeRoute')) {
        this.get('visit').perform(routeName);
      }
    },

    toggleExpand() {
      this.toggleProperty('isExpanded');
    },

    reset() {
      this.reset();
    }
  }

});
