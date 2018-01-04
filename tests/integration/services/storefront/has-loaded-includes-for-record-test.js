import { moduleFor, test } from 'ember-qunit';
import { Model, hasMany, belongsTo } from 'ember-cli-mirage';
import MirageServer from 'dummy/tests/integration/helpers/mirage-server';
import { run } from '@ember/runloop';

moduleFor('service:storefront', 'Integration | Services | Storefront | hasLoadedIncludesForRecord', {
  integration: true,

  beforeEach() {
    this.server = new MirageServer({
      models: {
        post: Model.extend({
          comments: hasMany(),
          tags: hasMany()
        }),
        comment: Model.extend({
          post: belongsTo()
        }),
        tag: Model.extend({
          posts: hasMany()
        })
      },
      baseConfig() {
        this.resource('posts');
      }
    });
    this.storefront = this.subject();
  },

  afterEach() {
    this.server.shutdown();
  }
});

test('it returns true if the relationship has been loaded', async function(assert) {
  let serverPost = this.server.create('post');
  this.server.createList('comment', 3, { post: serverPost });

  await run(() => {
    return this.storefront.findRecord('post', serverPost.id, {
      include: 'comments'
    });
  });

  assert.ok(this.storefront.hasLoadedIncludesForRecord('post', serverPost.id, 'comments'));
});

test('it returns false if the relationship has not been loaded', async function(assert) {
  let serverPost = this.server.create('post');
  this.server.createList('comment', 3, { post: serverPost });

  await run(() => {
    return this.storefront.findRecord('post', serverPost.id);
  });

  assert.notOk(this.storefront.hasLoadedIncludesForRecord('post', serverPost.id, 'comments'));
});
