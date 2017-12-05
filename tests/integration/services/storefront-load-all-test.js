import { moduleFor, test } from 'ember-qunit';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';
import { waitFor } from 'ember-wait-for-test-helper/wait-for';

moduleFor('service:storefront', 'Integration | Services | Storefront | loadAll', {
  integration: true,

  beforeEach() {
    this.server = startMirage();
    this.storefront = this.subject();
  },

  afterEach() {
    this.server.shutdown();
  }
});

test('loadAll should find records', async function(assert) {
  let post = server.create('post');

  let posts = await this.storefront.loadAll('post');

  assert.equal(posts.get('length'), 1);
  assert.equal(posts.get('firstObject.id'), post.id);
});

test('loadAll should find records with a query object', async function(assert) {
  server.create('post');
  let post = server.create('post', { title: 'Testing 123' });

  let posts = await this.storefront.loadAll('post', {
    filter: {
      slug: 'testing-123'
    }
  });

  assert.equal(posts.get('length'), 1);
  assert.equal(posts.get('firstObject.id'), post.id);
});

test('loadAll should update an existing record set in the background', async function(assert) {
  server.create('post');

  // this one blocks
  let posts1 = await this.storefront.loadAll('post');

  server.create('post');

  // this one insta fulfills
  let posts2 = await this.storefront.loadAll('post');

  // the background reload hasnt completed yet, so there should
  // only be one object in the set
  assert.equal(posts2.get('length'), 1);

  // wait for the background reload to complete
  waitFor(() => posts2.get('length') === 2);

  assert.equal(posts1, posts2);
});

test('loadAll should use two different record sets for two different queries', async function(assert) {
  server.create('post');

  let posts1 = await this.storefront.loadAll('post', { page: { limit: 1 }});
  let posts2 = await this.storefront.loadAll('post', { page: { limit: 2 }});

  assert.notEqual(posts1, posts2);
});

test('loadAll should return a blocking promise if told to reload an existing record set', async function(assert) {
  server.create('post');

  let posts1 = await this.storefront.loadAll('post');

  server.create('post');

  let posts2 = await this.storefront.loadAll('post', { reload: true });

  assert.equal(posts2.get('length'), 2);
  assert.equal(posts1, posts2);
});
