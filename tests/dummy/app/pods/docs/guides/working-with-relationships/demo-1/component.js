import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { defineProperty, notifyPropertyChange } from '@ember/object';
import { action } from '@ember/object';

export default class DocsDemo1Component extends Component {
  @service store;

  constructor() {
    super(...arguments);

    this.loadPost.perform();
    this.setup();
  }

  @task *loadPost() {
    return yield this.store.findRecord('post', 1);
  }

  get post() {
    return this.loadPost.lastSuccessful?.value;
  }

  setup() {
    let tasks = {
      // BEGIN-SNIPPET working-with-relationships-demo-1.js
      loadComments: task(function* () {
        yield this.post.load('comments');
      }),
      // END-SNIPPET
    };

    this.store.resetCache();
    // We do this to reset loadComments state
    defineProperty(this, 'loadComments', tasks.loadComments);
    notifyPropertyChange(this, 'loadComments');
  }

  @action reset() {
    this.setup();
  }
}
