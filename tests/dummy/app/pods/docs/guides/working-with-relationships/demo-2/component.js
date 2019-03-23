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
    return yield this.get('store').findRecord('post', 2);
  }),

  post: readOnly('loadPost.lastSuccessful.value'),

  setup() {
    let tasks = {
      // BEGIN-SNIPPET working-with-relationships-demo-2.js
      sideloadComments: task(function*() {
        yield this.get('post').sideload('comments');
      })
      // END-SNIPPET
    };

    this.get('store').resetCache();
    // We do this to reset loadComments state
    defineProperty(this, 'sideloadComments', tasks.sideloadComments);
    this.notifyPropertyChange('sideloadComments');
  },

  actions: {
    reset() {
      this.setup();
    }
  }


});
