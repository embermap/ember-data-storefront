import Model from '@ember-data/model';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { settled, waitUntil } from '@ember/test-helpers';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';
import LoadableModel from 'ember-data-storefront/mixins/loadable-model';
import LoadableStore from 'ember-data-storefront/mixins/loadable-store';

module('Integration | Mixins | LoadableModel | sideload', function (hooks) {
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

  test('#sideload can load includes', async function (assert) {
    let requests = [];
    server.pretender.handledRequest = function (...args) {
      requests.push(args[2]);
    };

    let post = await this.store.findRecord('post', 1);

    assert.equal(post.hasMany('comments').value(), null);

    post = await post.sideload('comments');

    assert.equal(post.hasMany('comments').value().get('length'), 2);
    assert.equal(requests.length, 2);
    assert.equal(requests[1].url, '/posts/1?include=comments');
  });

  test('#sideload returns a resolved promise if its already loaded includes, and reloads in the background', async function (assert) {
    let serverCalls = 0;
    server.pretender.handledRequest = function () {
      serverCalls++;
    };

    let post = await this.store.findRecord('post', 1);

    assert.equal(serverCalls, 1);

    // kind of britle, but we want to slow the server down a little
    // so we can be sure our test is blocked by the next call to load.
    server.timing = 500;

    await post.sideload('comments');

    assert.equal(serverCalls, 2);
    assert.equal(post.hasMany('comments').value().get('length'), 2);
    server.create('comment', { postId: 1 });

    await post.sideload('comments');

    assert.equal(serverCalls, 2);
    await waitUntil(() => serverCalls === 3);
    await settled();

    assert.equal(post.hasMany('comments').value().get('length'), 3);
  });

  test('#sideload can take multiple arguments', async function (assert) {
    let tag = server.create('tag');
    let miragePost = this.server.schema.posts.find(1);
    miragePost.update({ tags: [tag] });

    let post = await this.store.findRecord('post', 1);

    await post.sideload('comments', 'tags');

    assert.equal(post.hasMany('comments').value().get('length'), 2);
    assert.equal(post.hasMany('tags').value().get('length'), 1);
  });

  test('#sideload can take options, like reload: true', async function (assert) {
    let serverCalls = 0;
    server.pretender.handledRequest = function () {
      serverCalls++;
    };

    let post = await this.store.findRecord('post', 1, { include: 'comments' });

    assert.equal(serverCalls, 1);

    await post.sideload('comments', { reload: true });

    assert.equal(serverCalls, 2);
  });

  test('#sideload should not make a network request if the relationship is loaded, but backgroundReload is false', async function (assert) {
    let requests = [];

    server.pretender.handledRequest = function (...args) {
      requests.push(args[2]);
    };

    // first load waits and blocks
    let post = await this.store.loadRecord('post', 1, { include: 'comments' });
    assert.equal(post.hasMany('comments').value().length, 2);

    // second load doesnt block, instantly returns
    await post.sideload('comments', { backgroundReload: false });
    assert.equal(requests.length, 1);

    // wait 500ms and make sure there's no network request
    await new Promise((resolve) => setTimeout(resolve, 500));

    assert.equal(requests.length, 1);
  });
});
