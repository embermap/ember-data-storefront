import { module, test, setupTest } from 'ember-qunit';
import { waitUntil } from '@ember/test-helpers';
import MirageServer from 'dummy/tests/integration/helpers/mirage-server';
import { Model, hasMany, belongsTo } from 'ember-cli-mirage';
import LoadableStore from 'ember-data-storefront/mixins/loadable-store';

module('Integration | Mixins | LoadableStore | loadAll', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
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

    this.store = this.owner.lookup('service:store');
    this.store.reopen(LoadableStore);
    this.store.resetCache();
  });

  hooks.afterEach(function() {
    this.server.shutdown();
  });

  test('it can load a collection', async function(assert) {
    let post = this.server.create('post');

    let posts = await this.store.loadAll('post');

    assert.equal(posts.get('length'), 1);
    assert.equal(posts.get('firstObject.id'), post.id);
  });

  test('it resolves immediately with an already-loaded collection, then reloads it in the background', async function(assert) {
    let serverPost = this.server.createList('post', 2);
    let serverCalls = 0;
    this.server.pretender.handledRequest = () => serverCalls++;

    let posts = await this.store.loadAll('post', serverPost.id);

    assert.equal(serverCalls, 1);
    assert.equal(posts.get('length'), 2);

    this.server.create('post');
    posts = await this.store.loadAll('post', serverPost.id);

    assert.equal(serverCalls, 1);
    assert.equal(posts.get('length'), 2);

    await waitUntil(() => serverCalls === 2);
    assert.equal(posts.get('length'), 3);
  });

  test('it forces an already-loaded collection to fetch with the reload options', async function(assert) {
    this.server.createList('post', 3);
    let serverCalls = 0;
    this.server.pretender.handledRequest = () => serverCalls++;

    await this.store.loadAll('post', { reload: true });
    let posts = await this.store.loadAll('post', { reload: true });

    assert.equal(serverCalls, 2);
    assert.equal(posts.get('length'), 3);
  });

  test('it can load a collection with a query object', async function(assert) {
    let serverPosts = this.server.createList('post', 2);
    let serverCalls = [];
    this.server.pretender.handledRequest = (...args) => {
      serverCalls.push(args);
    };

    let posts = await this.store.loadAll('post', {
      filter: {
        testing: 123
      }
    });

    assert.equal(posts.get('length'), 2);
    assert.equal(posts.get('firstObject.id'), serverPosts[0].id);
    assert.equal(serverCalls.length, 1);
    assert.deepEqual(serverCalls[0][2].queryParams, { "filter[testing]": "123" } );
  });

  test('it can load a collection with includes', async function(assert) {
    let serverPost = this.server.create('post', {
      comments: this.server.createList('comment', 2)
    });
    let serverCalls = [];
    this.server.pretender.handledRequest = function() {
      serverCalls.push(arguments);
    };

    let posts = await this.store.loadAll('post', {
      include: 'comments'
    });

    assert.equal(posts.get('length'), 1);
    assert.equal(posts.get('firstObject.id'), serverPost.id);
    assert.equal(posts.get('firstObject.comments.length'), 2);
  });
});
