import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { waitUntil } from '@ember/test-helpers';
import MirageServer from 'dummy/tests/integration/helpers/mirage-server';
import { Model, hasMany, belongsTo } from 'ember-cli-mirage';
import { run } from '@ember/runloop';
import LoadableStore from 'ember-data-storefront/mixins/loadable-store';

module('Integration | Mixins | LoadableStore | loadRecord', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.server = new MirageServer({
      models: {
        // eslint-disable-next-line ember/no-new-mixins
        post: Model.extend({
          comments: hasMany(),
          author: belongsTo(),
          tags: hasMany(),
        }),
        // eslint-disable-next-line ember/no-new-mixins
        comment: Model.extend({
          post: belongsTo(),
          author: belongsTo(),
        }),
        // eslint-disable-next-line ember/no-new-mixins
        tag: Model.extend({
          posts: hasMany(),
        }),
        // eslint-disable-next-line ember/no-new-mixins
        author: Model.extend({
          comments: hasMany(),
          posts: hasMany(),
        }),
      },
      baseConfig() {
        this.resource('posts');
      },
    });

    this.store = this.owner.lookup('service:store');
    this.store.reopen(LoadableStore);
    this.store.resetCache();
  });

  hooks.afterEach(function () {
    this.server.shutdown();
  });

  test('it can load a record', async function (assert) {
    let serverPost = this.server.create('post');

    let post = await run(() => {
      return this.store.loadRecord('post', serverPost.id);
    });

    assert.equal(post.get('id'), serverPost.id);
  });

  test('it resolves immediately with an already-loaded record, then reloads it in the background', async function (assert) {
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

    await waitUntil(() => serverCalls === 2);
  });

  test('it forces already-loaded records to fetch with the reload option', async function (assert) {
    let serverPost = this.server.create('post');
    let serverCalls = 0;
    this.server.pretender.handledRequest = function (method, url, request) {
      serverCalls++;

      // the reload qp should not be sent
      assert.notOk(request.queryParams.reload);
    };

    await run(() => {
      return this.store.loadRecord('post', serverPost.id, { reload: true });
    });

    await run(() => {
      return this.store.loadRecord('post', serverPost.id, { reload: true });
    });

    assert.equal(serverCalls, 2);
  });

  test('it can load a record with includes', async function (assert) {
    let serverPost = this.server.create('post');
    this.server.createList('comment', 3, { post: serverPost });

    let post = await run(() => {
      return this.store.loadRecord('post', serverPost.id, {
        include: 'comments',
      });
    });

    assert.equal(post.get('id'), serverPost.id);
    assert.equal(post.get('comments.length'), 3);
  });

  test(`it resolves immediately with an already-loaded includes query, then reloads it in the background`, async function (assert) {
    let serverPost = this.server.create('post', { title: 'My post' });
    this.server.createList('comment', 3, { post: serverPost });
    let serverCalls = [];
    this.server.pretender.handledRequest = function (verb, url) {
      serverCalls.push(url);
    };

    await run(() => {
      return this.store.loadRecord('post', serverPost.id, {
        include: 'comments',
      });
    });

    assert.equal(serverCalls.length, 1);

    let post = await run(() => {
      return this.store.loadRecord('post', serverPost.id, {
        include: 'comments',
      });
    });

    assert.equal(serverCalls.length, 1);
    assert.equal(serverCalls[0], '/posts/1?include=comments');
    assert.equal(post.get('comments.length'), 3);

    await waitUntil(() => serverCalls.length === 2);

    assert.equal(serverCalls[1], '/posts/1?include=comments');
  });

  test('it blocks when including an association for the first time', async function (assert) {
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
        include: 'comments',
      });
    });

    assert.equal(serverCalls, 2);
    assert.equal(post.hasMany('comments').value().get('length'), 3);
  });

  test('it resolves immediately with an includes-only query whose relationships have already been loaded', async function (assert) {
    let serverPost = this.server.create('post');
    this.server.createList('comment', 3, { post: serverPost });
    this.server.createList('tag', 2, { posts: [serverPost] });
    let serverCalls = 0;
    this.server.pretender.handledRequest = () => serverCalls++;

    let post = await run(() => {
      return this.store.loadRecord('post', serverPost.id, {
        include: 'comments',
      });
    });

    assert.equal(post.hasMany('comments').value().get('length'), 3);
    assert.equal(serverCalls, 1);

    post = await run(() => {
      return this.store.loadRecord('post', serverPost.id, {
        include: 'tags',
      });
    });

    assert.equal(post.hasMany('tags').value().get('length'), 2);

    post = await run(() => {
      return this.store.loadRecord('post', serverPost.id, {
        include: 'tags,comments',
      });
    });

    assert.equal(serverCalls, 2);
  });

  test('loadRecord resolves immediately if its called with no options and the record is already in the store from loadRecords, then reloads it in the background', async function (assert) {
    let serverPost = this.server.create('post', { title: 'My post' });
    let serverCalls = 0;
    this.server.pretender.handledRequest = function () {
      serverCalls++;
    };

    await run(() => {
      return this.store.loadRecords('post');
    });

    let post = await run(() => {
      return this.store.loadRecord('post', serverPost.id);
    });

    assert.equal(serverCalls, 1);
    assert.equal(post.get('title'), 'My post');

    await waitUntil(() => serverCalls === 2);
  });

  test('loadRecord blocks if its called with an includes, even if the record has already been loaded from loadRecords', async function (assert) {
    let serverPost = this.server.create('post', { title: 'My post' });
    let serverCalls = 0;
    this.server.pretender.handledRequest = function () {
      serverCalls++;
    };

    await run(() => {
      return this.store.loadRecords('post');
    });

    let post = await run(() => {
      return this.store.loadRecord('post', serverPost.id, {
        include: 'comments',
      });
    });

    assert.equal(serverCalls, 2);
    assert.equal(post.get('title'), 'My post');
  });

  test('loadRecord should not refresh the model in the background if background reload is false', async function (assert) {
    let serverPost = this.server.create('post', { title: 'My post' });
    let serverCalls = 0;

    this.server.pretender.handledRequest = function () {
      serverCalls++;
    };

    await run(() => {
      return this.store.loadRecord('post', serverPost.id);
    });

    await run(() => {
      return this.store.loadRecord('post', serverPost.id, {
        backgroundReload: false,
      });
    });

    assert.equal(serverCalls, 1);

    // wait 500ms and make sure there's no network request
    await new Promise((resolve) => setTimeout(resolve, 500));

    assert.equal(serverCalls, 1);
  });
});
