import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import MirageServer from 'dummy/tests/integration/helpers/mirage-server';
import { Model } from 'ember-cli-mirage';
import LoadableStore from 'ember-data-storefront/mixins/loadable-store';

module('Integration | Changing data render test', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.server = new MirageServer({
      models: {
        post: Model.extend(),
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

  test('record queries trigger template rerenders', async function (assert) {
    let serverPost = this.server.create('post', { title: 'Lorem' });
    let postId = serverPost.id;

    await this.store.loadRecord('post', postId).then((post) => {
      this.set('model', post);
    });

    await render(hbs`
      <div data-test-title>
        {{this.model.title}}
      </div>
    `);

    assert.dom('[data-test-title]').hasText('Lorem');

    this.server.schema.posts.find(serverPost.id).update('title', 'ipsum');

    await this.store.loadRecord('post', postId, { reload: true });
    await settled();

    assert.dom('[data-test-title]').hasText('ipsum');
  });

  test('record array queries trigger template rerenders', async function (assert) {
    this.server.createList('post', 2);

    await this.store.loadRecords('post').then((posts) => {
      this.set('model', posts);
    });

    await render(hbs`
      <ul>
        {{#each this.model as |post|}}
          <li>{{post.id}}</li>
        {{/each}}
      </ul>
    `);

    assert.dom('li').exists({ count: 2 });

    this.server.create('post');
    await this.model.update();
    await settled();

    assert.dom('li').exists({ count: 3 });
  });
});
