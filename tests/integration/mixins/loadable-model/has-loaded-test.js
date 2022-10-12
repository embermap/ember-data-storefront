import Model from '@ember-data/model';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';
import LoadableModel from 'ember-data-storefront/mixins/loadable-model';
import LoadableStore from 'ember-data-storefront/mixins/loadable-store';

module('Integration | Mixins | LoadableModel | hasLoaded', function (hooks) {
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

  test('#hasLoaded returns true if a relationship has been loaded', async function (assert) {
    let post = await this.store.findRecord('post', 1);

    await post.load('comments');

    assert.ok(post.hasLoaded('comments'));
  });

  test('#hasLoaded returns true if a relationship has been sideloaded', async function (assert) {
    let post = await this.store.findRecord('post', 1);

    await post.sideload('comments');

    assert.ok(post.hasLoaded('comments'));
  });

  test('#hasLoaded returns true if the relationship chain has been sideloaded', async function (assert) {
    let post = await this.store.findRecord('post', 1);

    await post.sideload('comments.author');

    assert.ok(post.hasLoaded('comments.author'));
  });

  test('#hasLoaded returns false if the relationship has not been sideloaded', async function (assert) {
    let post = await this.store.findRecord('post', 1);

    assert.notOk(post.hasLoaded('comments'));
  });

  test('#hasLoaded returns false if another relationship has not been sideloaded', async function (assert) {
    let post = await this.store.findRecord('post', 1);

    await post.sideload('comments');

    assert.notOk(post.hasLoaded('tags'));
  });

  test('#hasLoaded returns false if a relationship chain has not been fully sideloaded', async function (assert) {
    let post = await this.store.findRecord('post', 1);

    await post.sideload('comments');

    assert.notOk(post.hasLoaded('comments.author'));
  });

  test('#hasLoaded returns false for similarly named relationships', async function (assert) {
    let post = await this.store.findRecord('post', 1);

    await post.sideload('comments.author');

    assert.notOk(post.hasLoaded('author'));
  });
});
