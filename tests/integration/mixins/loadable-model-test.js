import { moduleFor, test } from 'ember-qunit';
import { waitFor } from 'ember-wait-for-test-helper/wait-for';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';
import { run } from '@ember/runloop';
import DS from 'ember-data';
import LoadableModel from 'ember-data-storefront/mixins/loadable-model';

moduleFor('mixin:loadable-model', 'Integration | Mixins | LoadableModel', {
  integration: true,

  beforeEach() {
    DS.Model.reopen(LoadableModel);
    this.server = startMirage();
    this.inject.service('store')

    let post = server.create('post', { id: 1 });
    let author = server.create('author');
    server.createList('comment', 2, { post, author });
  },

  afterEach() {
    this.server.shutdown();
  }
});

test('#load can load includes', async function(assert) {
  let requests = [];
  server.pretender.handledRequest = (...args) => {
    requests.push(args[2]);
  };

  let post = await run(() => {
    return this.store.findRecord('post', 1)
  });

  assert.equal(post.hasMany('comments').value(), null);

  post = await run(() => {
    return post.load('comments');
  });

  assert.equal(post.hasMany('comments').value().get('length'), 2);
  assert.equal(requests.length, 2);
  assert.equal(requests[1].url, '/posts/1?include=comments');
});

test('#load returns a resolved promise if its already loaded includes, and reloads in the background', async function(assert) {
  let serverCalls = 0;
  server.pretender.handledRequest = () => serverCalls++;

  let post = await run(() => {
    return this.store.findRecord('post', 1)
  });

  assert.equal(serverCalls, 1);

  await run(() => {
    return post.load('comments');
  });

  assert.equal(serverCalls, 2);
  assert.equal(post.hasMany('comments').value().get('length'), 2);
  server.create('comment', { postId: 1 });

  await run(() => {
    return post.load('comments');
  });

  await waitFor(() => serverCalls === 3);

  assert.equal(post.hasMany('comments').value().get('length'), 3);
});

test('#hasLoaded returns true if the relationship has been loaded', async function(assert) {
  let post = await run(() => {
    return this.store.findRecord('post', 1)
  });

  await run(() => {
    return post.load('comments.author');
  });

  assert.ok(post.hasLoaded('comments.author'));
});

test('#hasLoaded returns false if the relationship has not been loaded', async function(assert) {
  let post = await run(() => {
    return this.store.findRecord('post', 1)
  });

  await run(() => {
    return post.load('comments');
  });

  assert.notOk(post.hasLoaded('tags'));
});

test('#hasLoaded returns true if a relationship chain has been loaded', async function(assert) {
  let post = await run(() => {
    return this.store.findRecord('post', 1)
  });

  await run(() => {
    return post.load('comments');
  });

  assert.ok(post.hasLoaded('comments'));
});

test('#hasLoaded returns false if a relationship chain has not been fully loaded', async function(assert) {
  let post = await run(() => {
    return this.store.findRecord('post', 1)
  });

  await run(() => {
    return post.load('comments');
  });

  assert.notOk(post.hasLoaded('comments.author'));
});

test('#hasLoaded returns false for similarly named relationships', async function(assert) {
  let post = await run(() => {
    return this.store.findRecord('post', 1)
  });

  await run(() => {
    return post.load('comments.author');
  });

  assert.notOk(post.hasLoaded('author'));
});
