import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { Model, hasMany, belongsTo } from 'ember-cli-mirage';
import MirageServer from 'dummy/tests/integration/helpers/mirage-server';
import { run } from '@ember/runloop';
import LoadableStore from 'ember-data-storefront/mixins/loadable-store';

module(
  'Integration | Mixins | LoadableStore | hasLoadedIncludesForRecord',
  function (hooks) {
    setupTest(hooks);

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

      this.store = this.owner.lookup('service:store');
      this.store.reopen(LoadableStore);
      this.store.resetCache();
    });

    hooks.afterEach(function () {
      this.server.shutdown();
    });

    test('it returns true if the relationship has been loaded', async function (assert) {
      let serverPost = this.server.create('post');
      this.server.createList('comment', 3, { post: serverPost });

      await run(() => {
        return this.store.loadRecord('post', serverPost.id, {
          include: 'comments',
        });
      });

      assert.ok(
        this.store.hasLoadedIncludesForRecord('post', serverPost.id, 'comments')
      );
    });

    test('it returns false if the relationship has not been loaded', async function (assert) {
      let serverPost = this.server.create('post');
      this.server.createList('comment', 3, { post: serverPost });

      await run(() => {
        return this.store.loadRecord('post', serverPost.id);
      });

      assert.notOk(
        this.store.hasLoadedIncludesForRecord('post', serverPost.id, 'comments')
      );
    });
  }
);
