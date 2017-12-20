import { moduleFor, test } from 'ember-qunit';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';
import { run } from '@ember/runloop';
import DS from 'ember-data';
import Loadable from 'ember-data-storefront/mixins/loadable';

moduleFor('mixin:loadable', 'Integration | Mixins | Loadable', {
  integration: true,

  beforeEach() {
    DS.Model.reopen(Loadable);
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
