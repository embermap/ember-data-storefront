import { moduleFor, test } from 'ember-qunit';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';
import { run } from '@ember/runloop';

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

test('it can load includes', async function(assert) {
  server.create('post', { id: 1 });
  server.createList('comment', 2, { postId: 1 });

  let post = await run(() => {
    return this.store.findRecord('post', 1)
  });

  assert.equal(post.hasMany('comments').value(), null);

  post = await run(() => {
    return post.load('comments');
  });

  assert.equal(post.hasMany('comments').value().get('length'), 2);
});
