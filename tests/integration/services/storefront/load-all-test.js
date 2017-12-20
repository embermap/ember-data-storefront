import { moduleFor, test } from 'ember-qunit';
import { waitFor } from 'ember-wait-for-test-helper/wait-for';
import { Model, hasMany, belongsTo, JSONAPISerializer } from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';

moduleFor('service:storefront', 'Integration | Services | Storefront | loadAll', {
  integration: true,

  beforeEach() {
    this.server = new Server({
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
      serializers: {
        application: JSONAPISerializer
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

test('it can load a collection', async function(assert) {
  let post = this.server.create('post');

  let posts = await this.storefront.loadAll('post');

  assert.equal(posts.get('length'), 1);
  assert.equal(posts.get('firstObject.id'), post.id);
});

test('it resolves immediately with an already-loaded collection, then reloads it in the background', async function(assert) {
  let serverPost = this.server.createList('post', 2);
  let serverCalls = 0;
  this.server.pretender.handledRequest = () => serverCalls++;

  let posts = await this.storefront.loadAll('post', serverPost.id);

  assert.equal(serverCalls, 1);
  assert.equal(posts.get('length'), 2);

  this.server.create('post');
  posts = await this.storefront.loadAll('post', serverPost.id);

  assert.equal(serverCalls, 1);
  assert.equal(posts.get('length'), 2);

  await waitFor(() => serverCalls === 2);
  assert.equal(posts.get('length'), 3);
});

test('it forces an already-loaded collection to fetch with the reload options', async function(assert) {
  this.server.createList('post', 3);
  let serverCalls = 0;
  this.server.pretender.handledRequest = () => serverCalls++;

  await this.storefront.loadAll('post', { reload: true });
  let posts = await this.storefront.loadAll('post', { reload: true });

  assert.equal(serverCalls, 2);
  assert.equal(posts.get('length'), 3);
});

test('it can load a collection with a query object', async function(assert) {
  let serverPosts = this.server.createList('post', 2);
  let serverCalls = [];
  this.server.pretender.handledRequest = (...args) => {
    serverCalls.push(args);
  };

  let posts = await this.storefront.loadAll('post', {
    filter: {
      testing: 123
    }
  });

  assert.equal(posts.get('length'), 2);
  assert.equal(posts.get('firstObject.id'), serverPosts[0].id);
  assert.equal(serverCalls.length, 1);
  assert.deepEqual(serverCalls[0][2].queryParams, { "filter[testing]": "123" } );
});

test('it can load a collection with includes', async function(assert) {
  let serverPost = this.server.create('post', {
    comments: this.server.createList('comment', 2)
  });
  let serverCalls = [];
  this.server.pretender.handledRequest = function() {
    serverCalls.push(arguments);
  };

  let posts = await this.storefront.loadAll('post', {
    include: 'comments'
  });

  assert.equal(posts.get('length'), 1);
  assert.equal(posts.get('firstObject.id'), serverPost.id);
  assert.equal(posts.get('firstObject.comments.length'), 2);
});
