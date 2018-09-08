import { module, test, setupTest } from 'ember-qunit';
import MirageServer from 'dummy/tests/integration/helpers/mirage-server';
import { Model, hasMany, belongsTo } from 'ember-cli-mirage';
import { run } from '@ember/runloop';
import { waitFor } from 'ember-wait-for-test-helper/wait-for';
import LoadableStore from 'ember-data-storefront/mixins/loadable-store';

module('Integration | Mixins | LoadableStore | loadRecord', function(hooks) {
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

  test('it can load a record', async function(assert) {
    let serverPost = this.server.create('post');

    let post = await run(() => {
      return this.store.loadRecord('post', serverPost.id);
    });

    assert.equal(post.get('id'), serverPost.id);
  });

  test('it resolves immediately with an already-loaded record, then reloads it in the background', async function(assert) {
    let serverPost = this.server.create('post', { title: 'My post' });
    let serverCalls = 0;
    this.server.pretender.handledRequest = () => serverCalls++;

    await run(() => {
      return this.store.loadRecord('post', serverPost.id);
    });

    let post = await run(() => {
      return this.store.loadRecord('post', serverPost.id);
    });

    assert.equal(serverCalls, 1);
    assert.equal(post.get('title'), 'My post');

    await waitFor(() => serverCalls === 2);
  });

  test('it forces already-loaded records to fetch with the reload option', async function(assert) {
    let serverPost = this.server.create('post');
    let serverCalls = 0;
    this.server.pretender.handledRequest = () => serverCalls++;

    await run(() => {
      return this.store.loadRecord('post', serverPost.id, { reload: true });
    });

    await run(() => {
      return this.store.loadRecord('post', serverPost.id, { reload: true });
    });

    assert.equal(serverCalls, 2);
  });

  test('it can load a record with includes', async function(assert) {
    let serverPost = this.server.create('post');
    this.server.createList('comment', 3, { post: serverPost });

    let post = await run(() => {
      return this.store.loadRecord('post', serverPost.id, {
        include: 'comments'
      });
    });

    assert.equal(post.get('id'), serverPost.id);
    assert.equal(post.get('comments.length'), 3);
  });

  test(`it resolves immediately with an already-loaded includes query, then reloads it in the background`, async function(assert) {
    let serverPost = this.server.create('post', { title: 'My post' });
    this.server.createList('comment', 3, { post: serverPost });
    let serverCalls = [];
    this.server.pretender.handledRequest = function(verb, url) {
      serverCalls.push(url);
    };

    await run(() => {
      return this.store.loadRecord('post', serverPost.id, {
        include: 'comments'
      });
    });

    assert.equal(serverCalls.length, 1);

    let post = await run(() => {
      return this.store.loadRecord('post', serverPost.id, {
        include: 'comments'
      });
    });

    assert.equal(serverCalls.length, 1);
    assert.equal(serverCalls[0], '/posts/1?include=comments');
    assert.equal(post.get('comments.length'), 3);

    await waitFor(() => serverCalls.length === 2);

    assert.equal(serverCalls[1], '/posts/1?include=comments');
  });

  test('it blocks when including an association for the first time', async function(assert) {
    let serverPost = this.server.create('post');
    this.server.createList('comment', 3, { post: serverPost });
    let serverCalls = 0;
    this.server.pretender.handledRequest = () => serverCalls++;

    let post = await run(() => {
      return this.store.loadRecord('post', serverPost.id);
    });

    assert.equal(post.get('id'), serverPost.id);
    assert.equal(post.hasMany('comments').value(), null);
    assert.equal(serverCalls, 1);

    post = await run(() => {
      return this.store.loadRecord('post', serverPost.id, {
        include: 'comments'
      });
    });

    assert.equal(serverCalls, 2);
    assert.equal(post.hasMany('comments').value().get('length'), 3);
  });

  test('it resolves immediately with an includes-only query whose relationships have already been loaded', async function(assert) {
    let serverPost = this.server.create('post');
    this.server.createList('comment', 3, { post: serverPost });
    this.server.createList('tag', 2, { posts: [ serverPost ] });
    let serverCalls = 0;
    this.server.pretender.handledRequest = () => serverCalls++;

    let post = await run(() => {
      return this.store.loadRecord('post', serverPost.id, {
        include: 'comments'
      });
    });

    assert.equal(post.hasMany('comments').value().get('length'), 3);
    assert.equal(serverCalls, 1);

    post = await run(() => {
      return this.store.loadRecord('post', serverPost.id, {
        include: 'tags'
      });
    });

    assert.equal(post.hasMany('tags').value().get('length'), 2);

    post = await run(() => {
      return this.store.loadRecord('post', serverPost.id, {
        include: 'tags,comments'
      });
    });

    assert.equal(serverCalls, 2);
  });

});
