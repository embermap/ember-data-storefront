import Model from '@ember-data/model';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { waitUntil } from '@ember/test-helpers';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';
import { run } from '@ember/runloop';
import LoadableModel from 'ember-data-storefront/mixins/loadable-model';
import LoadableStore from 'ember-data-storefront/mixins/loadable-store';

module('Integration | Mixins | LoadableModel | load', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    Model.reopen(LoadableModel);
    this.server = startMirage();

    this.store = this.owner.lookup('service:store');
    this.store.reopen(LoadableStore);
    this.store.resetCache();

    let author = server.create('author', { id: 1 });
    let post = server.create('post', { id: 1, author });
    server.createList('comment', 2, { post, author });
  }),
    hooks.afterEach(function () {
      this.server.shutdown();
      this.store = null;
    });

  test('#load errors when attempting to load multiple relationships', async function (assert) {
    let post = await run(() => {
      return this.store.findRecord('post', 1);
    });

    assert.throws(() => {
      post.load('comments.author');
    }, /The #load method only works with a single relationship/);
  });

  test('#load errors when given a relationship name that does not exist', async function (assert) {
    let post = await run(() => {
      return this.store.findRecord('post', 1);
    });

    assert.throws(() => {
      post.load('citations');
    }, /You tried to load the relationship citations for a post, but that relationship does not exist/);
  });

  test('#load can load a belongsTo relationship', async function (assert) {
    let requests = [];
    server.pretender.handledRequest = function (...args) {
      requests.push(args[2]);
    };

    let post = await run(() => this.store.findRecord('post', 1));
    assert.equal(post.belongsTo('author').value(), null);

    let author = await run(() => post.load('author'));

    assert.equal(post.belongsTo('author').value(), author);
    assert.equal(requests.length, 2);
    assert.equal(requests[1].url, '/posts/1/relationships/author');
  });

  test('#load can load a hasMany relationship', async function (assert) {
    let requests = [];
    server.pretender.handledRequest = function (...args) {
      requests.push(args[2]);
    };

    let post = await run(() => this.store.findRecord('post', 1));
    assert.equal(post.hasMany('comments').value(), null);

    let comments = await run(() => post.load('comments'));

    assert.equal(post.hasMany('comments').value(), comments);
    assert.equal(requests.length, 2);
    assert.equal(requests[1].url, '/posts/1/relationships/comments');
  });

  test('#load should not use a blocking fetch if the relationship has already been loaded', async function (assert) {
    let requests = [];

    server.pretender.handledRequest = function (...args) {
      requests.push(args[2]);
    };

    // first load waits and blocks
    let post = await run(() => {
      return this.store.findRecord('post', 1, { include: 'comments' });
    });
    assert.equal(post.hasMany('comments').value().length, 2);

    // kind of britle, but we want to slow the server down a little
    // so we can be sure our test is blocked by the next call to load.
    server.timing = 500;

    // second load doesnt block, instantly returns
    await run(() => {
      return post.load('comments');
    });
    assert.equal(requests.length, 1);

    // dont let test finish until second test does a background reload
    await waitUntil(() => requests.length === 2, { timeout: 5000 });
  });

  test('#load should use a blocking fetch if the relationship has already been loaded, but the reload option is true', async function (assert) {
    let requests = [];
    server.pretender.handledRequest = function (...args) {
      requests.push(args[2]);
    };

    let post = await run(() =>
      this.store.findRecord('post', 1, { include: 'comments' })
    );
    assert.equal(post.hasMany('comments').value().length, 2);

    let comments = await run(() => {
      return post.load('comments', { reload: true });
    });

    assert.equal(post.hasMany('comments').value(), comments);
    assert.equal(requests.length, 2);
    assert.equal(requests[1].url, '/posts/1/relationships/comments');
  });

  test('#load should not make a network request if the relationship is loaded, but backgroundReload is false', async function (assert) {
    let requests = [];

    server.pretender.handledRequest = function (...args) {
      requests.push(args[2]);
    };

    // first load waits and blocks
    let post = await run(() => {
      return this.store.findRecord('post', 1, { include: 'comments' });
    });
    assert.equal(post.hasMany('comments').value().length, 2);

    // second load doesnt block, instantly returns
    await run(() => {
      return post.load('comments', { backgroundReload: false });
    });
    assert.equal(requests.length, 1);

    // wait 500ms and make sure there's no network request
    await new Promise((resolve) => setTimeout(resolve, 500));

    assert.equal(requests.length, 1);
  });

  test('#load should make a network request if the relationship has not been loaded, but the backgroundReload option is false', async function (assert) {
    let requests = [];
    server.pretender.handledRequest = function (...args) {
      requests.push(args[2]);
    };

    let post = await run(() => this.store.findRecord('post', 1));
    assert.equal(post.hasMany('comments').value(), null);

    let comments = await run(() => {
      return post.load('comments', { backgroundReload: false });
    });

    assert.equal(post.hasMany('comments').value(), comments);
    assert.equal(requests.length, 2);
    assert.equal(requests[1].url, '/posts/1/relationships/comments');
  });

  test('#load should update the reference from an earlier load call', async function (assert) {
    let post = await run(() => this.store.findRecord('post', 1));

    let comments = await run(() => post.load('comments'));
    assert.equal(comments.length, 2);

    server.create('comment', { postId: post.id });

    run(() => post.load('comments'));

    assert.equal(comments.length, 2);
    await waitUntil(() => comments.length === 3);
  });
});
