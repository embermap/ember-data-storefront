import { module, test, setupTest } from 'ember-qunit';
import { waitUntil } from '@ember/test-helpers';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';
import { run } from '@ember/runloop';
import DS from 'ember-data';
import LoadableModel from 'ember-data-storefront/mixins/loadable-model';
import LoadableStore from 'ember-data-storefront/mixins/loadable-store';

module('Integration | Mixins | LoadableModel', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    DS.Model.reopen(LoadableModel);
    this.server = startMirage();

    this.store = this.owner.lookup('service:store');
    this.store.reopen(LoadableStore);
    this.store.resetCache();

    let author = server.create('author', { id: 1 });
    let post = server.create('post', { id: 1, author });
    server.createList('comment', 2, { post, author });
  }),

  hooks.afterEach(function() {
    this.server.shutdown();
    this.store = null;
  });

  test('#load errors when attempting to load multiple relationships', async function(assert) {
    let post = await run(() => {
      return this.store.findRecord('post', 1)
    });

    assert.throws(
      () => { post.load('comments.author'); },
      /The #load method only works with a single relationship/
    );
  });

  test('#load errors when given a relationship name that does not exist', async function(assert) {
    let post = await run(() => {
      return this.store.findRecord('post', 1)
    });

    assert.throws(
      () => { post.load('citations'); },
      /You tried to load the relationship citations for a post, but that relationship does not exist/
    );
  });

  test('#load can load a belongsTo relationship', async function(assert) {
    let requests = [];
    server.pretender.handledRequest = function(...args) {
      requests.push(args[2]);
    };

    let post = await run(() => this.store.findRecord('post', 1));
    assert.equal(post.belongsTo('author').value(), null);

    let author = await run(() => post.load('author'));

    assert.equal(post.belongsTo('author').value(), author);
    assert.equal(requests.length, 2);
    assert.equal(requests[1].url, '/posts/1/relationships/author');
  });

  test('#load can load a hasMany relationship', async function(assert) {
    let requests = [];
    server.pretender.handledRequest = function(...args) {
      requests.push(args[2]);
    };

    let post = await run(() => this.store.findRecord('post', 1));
    assert.equal(post.hasMany('comments').value(), null);

    let comments = await run(() => post.load('comments'));

    assert.equal(post.hasMany('comments').value(), comments);
    assert.equal(requests.length, 2);
    assert.equal(requests[1].url, '/posts/1/relationships/comments');
  });

  test('#load should do a background reload if the relationship has already been loaded', async function(assert) {
    let requests = [];

    server.pretender.handledRequest = function(...args) {
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

  test('#load should not do anything if relationship has already been loaded and we dont allow background reloading', async function(assert) {
    let requests = [];

    server.pretender.handledRequest = function(...args) {
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

    // lets sleep for 500 ms and make sure no background ajax requests were made
    await new Promise(resolve => setTimeout(resolve, 500));

    // still should only have one request
    assert.equal(requests.length, 1);
  });

  test('#load should use a blocking fetch if the relationship has already been loaded, but the reload option is true', async function(assert) {
    let requests = [];
    server.pretender.handledRequest = function(...args) {
      requests.push(args[2]);
    };

    let post = await run(() => this.store.findRecord('post', 1, { include: 'comments' }));
    assert.equal(post.hasMany('comments').value().length, 2);

    let comments = await run(() => {
      return post.load('comments', { reload: true });
    });

    assert.equal(post.hasMany('comments').value(), comments);
    assert.equal(requests.length, 2);
    assert.equal(requests[1].url, '/posts/1/relationships/comments');
  });

  test('#load should update the reference from an earlier load call', async function(assert) {
    let post = await run(() => this.store.findRecord('post', 1));

    let comments = await run(() => post.load('comments'));
    assert.equal(comments.length, 2);

    server.create('comment', { postId: post.id });

    run(() => post.load('comments'));

    assert.equal(comments.length, 2);
    await waitUntil(() => comments.length === 3);
  });

  test('#reloadWith can load includes', async function(assert) {
    let requests = [];
    server.pretender.handledRequest = function(...args) {
      requests.push(args[2]);
    };

    let post = await run(() => {
      return this.store.findRecord('post', 1)
    });

    assert.equal(post.hasMany('comments').value(), null);

    post = await run(() => {
      return post.reloadWith('comments');
    });

    assert.equal(post.hasMany('comments').value().get('length'), 2);
    assert.equal(requests.length, 2);
    assert.equal(requests[1].url, '/posts/1?include=comments');
  });

  test('#reloadWith returns a resolved promise if its already loaded includes, and reloads in the background', async function(assert) {
    let serverCalls = 0;
    server.pretender.handledRequest = function() { serverCalls++ };

    let post = await run(() => {
      return this.store.findRecord('post', 1)
    });

    assert.equal(serverCalls, 1);

    // kind of britle, but we want to slow the server down a little
    // so we can be sure our test is blocked by the next call to load.
    server.timing = 500;

    await run(() => {
      return post.reloadWith('comments');
    });

    assert.equal(serverCalls, 2);
    assert.equal(post.hasMany('comments').value().get('length'), 2);
    server.create('comment', { postId: 1 });

    await run(() => {
      return post.reloadWith('comments');
    });

    assert.equal(serverCalls, 2);
    await waitUntil(() => serverCalls === 3);

    assert.equal(post.hasMany('comments').value().get('length'), 3);
  });

  test('#hasLoaded returns true if a relationship has been loaded', async function(assert) {
    let post = await run(() => {
      return this.store.findRecord('post', 1)
    });

    await run(() => {
      return post.load('comments');
    });

    assert.ok(post.hasLoaded('comments'));
  });

  test('#hasLoaded returns true if a relationship has been sideloaded', async function(assert) {
    let post = await run(() => {
      return this.store.findRecord('post', 1)
    });

    await run(() => {
      return post.reloadWith('comments');
    });

    assert.ok(post.hasLoaded('comments'));
  });

  test('#hasLoaded returns true if the relationship chain has been sideloaded', async function(assert) {
    let post = await run(() => {
      return this.store.findRecord('post', 1)
    });

    await run(() => {
      return post.reloadWith('comments.author');
    });

    assert.ok(post.hasLoaded('comments.author'));
  });

  test('#hasLoaded returns false if the relationship has not been sideloaded', async function(assert) {
    let post = await run(() => {
      return this.store.findRecord('post', 1)
    });

    assert.notOk(post.hasLoaded('comments'));
  });

  test('#hasLoaded returns false if another relationship has not been sideloaded', async function(assert) {
    let post = await run(() => {
      return this.store.findRecord('post', 1)
    });

    await run(() => {
      return post.reloadWith('comments');
    });

    assert.notOk(post.hasLoaded('tags'));
  });

  test('#hasLoaded returns false if a relationship chain has not been fully sideloaded', async function(assert) {
    let post = await run(() => {
      return this.store.findRecord('post', 1)
    });

    await run(() => {
      return post.reloadWith('comments');
    });

    assert.notOk(post.hasLoaded('comments.author'));
  });

  test('#hasLoaded returns false for similarly named relationships', async function(assert) {
    let post = await run(() => {
      return this.store.findRecord('post', 1)
    });

    await run(() => {
      return post.reloadWith('comments.author');
    });

    assert.notOk(post.hasLoaded('author'));
  });
});
