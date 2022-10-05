import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { Model, hasMany, belongsTo } from 'ember-cli-mirage';
import MirageServer from 'dummy/tests/integration/helpers/mirage-server';
import { run } from '@ember/runloop';

module('Unit | Service | store', function (hooks) {
  setupTest(hooks);

  // has-loaded-includes-for-record-test

  hooks.beforeEach(function () {
    this.server = new MirageServer({
      models: {
        // eslint-disable-next-line ember/no-new-mixins
        post: Model.extend({
          comments: hasMany(),
          tags: hasMany(),
        }),
        // eslint-disable-next-line ember/no-new-mixins
        comment: Model.extend({
          post: belongsTo(),
        }),
        // eslint-disable-next-line ember/no-new-mixins
        tag: Model.extend({
          posts: hasMany(),
        }),
      },
      baseConfig() {
        this.resource('posts');
      },
    });

    let service = this.owner.lookup('service:store');
    service.resetCache();
  });

  hooks.afterEach(function () {
    this.server.shutdown();
  });

  test('it returns true if the relationship has been loaded', async function (assert) {
    let service = this.owner.lookup('service:store');

    let serverPost = this.server.create('post');
    this.server.createList('comment', 3, { post: serverPost });

    await run(() => {
      return service.loadRecord('post', serverPost.id, {
        include: 'comments',
      });
    });

    assert.ok(
      service.hasLoadedIncludesForRecord('post', serverPost.id, 'comments')
    );
  });

  test('it returns false if the relationship has not been loaded', async function (assert) {
    let service = this.owner.lookup('service:store');

    let serverPost = this.server.create('post');
    this.server.createList('comment', 3, { post: serverPost });

    await run(() => {
      return service.loadRecord('post', serverPost.id);
    });

    assert.notOk(
      service.hasLoadedIncludesForRecord('post', serverPost.id, 'comments')
    );
  });
});
