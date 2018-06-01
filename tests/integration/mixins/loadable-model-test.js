import { moduleFor, test } from 'ember-qunit';
import { waitFor } from 'ember-wait-for-test-helper/wait-for';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';
import { run } from '@ember/runloop';
import DS from 'ember-data';
import LoadableModel from 'ember-data-storefront/mixins/loadable-model';
import LoadableStore from 'ember-data-storefront/mixins/loadable-store';

moduleFor('mixin:loadable-model', 'Integration | Mixins | LoadableModel', {
  integration: true,

  beforeEach() {
    DS.Model.reopen(LoadableModel);
    this.server = startMirage();

    this.inject.service('store')
    this.store.reopen(LoadableStore);
    this.store.resetCache();

    let author = server.create('author', { id: 1 });
    let post = server.create('post', { id: 1, author });
    server.createList('comment', 2, { post, author });
  },

  afterEach() {
    this.server.shutdown();
  }
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
  server.pretender.handledRequest = (...args) => {
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
  server.pretender.handledRequest = (...args) => {
    requests.push(args[2]);
  };

  let post = await run(() => this.store.findRecord('post', 1));
  assert.equal(post.hasMany('comments').value(), null);

  let comments = await run(() => post.load('comments'));

  assert.equal(post.hasMany('comments').value(), comments);
  assert.equal(requests.length, 2);
  assert.equal(requests[1].url, '/posts/1/relationships/comments');
});

test('#load should not fetch if the relationship has already been loaded', async function(assert) {
  let requests = [];
  server.pretender.handledRequest = (...args) => {
    requests.push(args[2]);
  };

  let post = await run(() => this.store.findRecord('post', 1, { include: 'comments' }));
  assert.equal(post.hasMany('comments').value().length, 2);

  let comments = await run(() => post.load('comments'));

  assert.equal(post.hasMany('comments').value(), comments);
  assert.equal(requests.length, 1);
});

test('#load should fetch if the relationship has already been loaded, but the reload option is true', async function(assert) {
  let requests = [];
  server.pretender.handledRequest = (...args) => {
    requests.push(args[2]);
  };

  let post = await run(() => this.store.findRecord('post', 1, { include: 'comments' }));
  assert.equal(post.hasMany('comments').value().length, 2);

  let comments = await run(() => post.load('comments', { reload: true }));

  assert.equal(post.hasMany('comments').value(), comments);
  assert.equal(requests.length, 2);
  assert.equal(requests[1].url, '/posts/1/relationships/comments');
});

test('#sideload can load includes', async function(assert) {
  let requests = [];
  server.pretender.handledRequest = (...args) => {
    requests.push(args[2]);
  };

  let post = await run(() => {
    return this.store.findRecord('post', 1)
  });

  assert.equal(post.hasMany('comments').value(), null);

  post = await run(() => {
    return post.sideload('comments');
  });

  assert.equal(post.hasMany('comments').value().get('length'), 2);
  assert.equal(requests.length, 2);
  assert.equal(requests[1].url, '/posts/1?include=comments');
});

test('#sideload returns a resolved promise if its already loaded includes, and reloads in the background', async function(assert) {
  let serverCalls = 0;
  server.pretender.handledRequest = () => serverCalls++;

  let post = await run(() => {
    return this.store.findRecord('post', 1)
  });

  assert.equal(serverCalls, 1);

  await run(() => {
    return post.sideload('comments');
  });

  assert.equal(serverCalls, 2);
  assert.equal(post.hasMany('comments').value().get('length'), 2);
  server.create('comment', { postId: 1 });

  await run(() => {
    return post.sideload('comments');
  });

  await waitFor(() => serverCalls === 3);

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
    return post.sideload('comments');
  });

  assert.ok(post.hasLoaded('comments'));
});

test('#hasLoaded returns true if the relationship chain has been sideloaded', async function(assert) {
  let post = await run(() => {
    return this.store.findRecord('post', 1)
  });

  await run(() => {
    return post.sideload('comments.author');
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
    return post.sideload('comments');
  });

  assert.notOk(post.hasLoaded('tags'));
});

test('#hasLoaded returns false if a relationship chain has not been fully sideloaded', async function(assert) {
  let post = await run(() => {
    return this.store.findRecord('post', 1)
  });

  await run(() => {
    return post.sideload('comments');
  });

  assert.notOk(post.hasLoaded('comments.author'));
});

test('#hasLoaded returns false for similarly named relationships', async function(assert) {
  let post = await run(() => {
    return this.store.findRecord('post', 1)
  });

  await run(() => {
    return post.sideload('comments.author');
  });

  assert.notOk(post.hasLoaded('author'));
});
