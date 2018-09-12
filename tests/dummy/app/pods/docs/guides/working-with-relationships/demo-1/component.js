import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { readOnly } from '@ember/object/computed';
import { defineProperty } from '@ember/object';

export default Component.extend({

  store: service(),

  didInsertElement() {
    this._super(...arguments);

    this.get('loadPost').perform();
    this.setup();
  },

  loadPost: task(function*() {
    return yield this.get('store').findRecord('post', 1);
  }),

  post: readOnly('loadPost.lastSuccessful.value'),

  setup() {
    let tasks = {
      // BEGIN-SNIPPET working-with-relationships-demo-1.js
      loadComments: task(function*() {
        yield this.get('post').load('comments');
      })
      // END-SNIPPET
    };

    this.get('store').resetCache();
    // We do this to reset loadComments state
    defineProperty(this, 'loadComments', tasks.loadComments);
    this.notifyPropertyChange('loadComments');
  },

  actions: {
    reset() {
      this.setup();
    }
  }


});
