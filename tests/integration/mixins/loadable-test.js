import { moduleFor, test } from 'ember-qunit';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';
import Ember from 'ember';

moduleFor('mixin:loadable', 'Integration | Mixins | Loadable', {
  integration: true,

  beforeEach() {
    this.server = startMirage();
    this.inject.service('store')
  },

  afterEach() {
    this.server.shutdown();
  }
});

test('it should xyz', async function(assert) {
  server.create('post', { id: 1 });
  server.createList('comment', 2, { postId: 1 });

  let findPromise;
  Ember.run(() => {
    findPromise = this.store.findRecord('post', 1)
  });

  let post = await findPromise;

  let loadPromise;
  Ember.run(() => {
    loadPromise = post.load('comments');
  });

  await loadPromise;

  assert.equal(post.get('comments.length'), 2);
});
