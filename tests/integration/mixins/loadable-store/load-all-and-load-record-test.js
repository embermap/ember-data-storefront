import { moduleFor, test } from 'ember-qunit';
import { run } from '@ember/runloop';
import { waitFor } from 'ember-wait-for-test-helper/wait-for';
import { Model, hasMany, belongsTo } from 'ember-cli-mirage';
import MirageServer from 'dummy/tests/integration/helpers/mirage-server';
import LoadableStore from 'ember-data-storefront/mixins/loadable-store';

moduleFor('mixin:loadable-store', 'Integration | Mixins | LoadableStore | loadAll and loadRecord', {
  integration: true,

  beforeEach() {
    this.server = new MirageServer({
      models: {
        post: Model.extend({
          comments: hasMany(),
          tags: hasMany()
        }),
        comment: Model.extend({
          post: belongsTo()
        }),
        tag: Model.extend({
          posts: hasMany()
        })
      },
      baseConfig() {
        this.resource('posts');
      }
    });

    this.inject.service('store')
    this.store.reopen(LoadableStore);
    this.store.resetCache();
  },

  afterEach() {
    this.server.shutdown();
  }
});

test('loadRecord resolves immediately if its called with no options and the record is already in the store from loadAll, then reloads it in the background', async function(assert) {
  let serverPost = this.server.create('post', { title: 'My post' });
  let serverCalls = 0;
  this.server.pretender.handledRequest = function() {
    serverCalls++;
  };

  await run(() => {
    return this.store.loadAll('post');
  });

  let post = await run(() => {
    return this.store.loadRecord('post', serverPost.id);
  });

  assert.equal(serverCalls, 1);
  assert.equal(post.get('title'), 'My post');

  await waitFor(() => serverCalls === 2);
});

test('loadRecord blocks if its called with an includes, even if the record has already been loaded from loadAll', async function(assert) {
  let serverPost = this.server.create('post', { title: 'My post' });
  let serverCalls = 0;
  this.server.pretender.handledRequest = function() {
    serverCalls++;
  };

  await run(() => {
    return this.store.loadAll('post');
  });

  let post = await run(() => {
    return this.store.loadRecord('post', serverPost.id, {
      include: 'comments'
    });
  });

  assert.equal(serverCalls, 2);
  assert.equal(post.get('title'), 'My post');
});
