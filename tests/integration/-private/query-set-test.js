import { module, test } from 'ember-qunit';
import startApp from '../../helpers/start-app';
import destroyApp from '../../helpers/destroy-app';
import QuerySet from 'ember-data-storefront/-private/query-set';

module('Integration | -Private | QuerySet', {
  beforeEach() {
    this.application = startApp();
    this.store = this.application.__container__.lookup('service:store');
  },

  afterEach() {
    destroyApp(this.application);
    server.shutdown();
  }
});

test('query should make an api request and update the record set', async function(assert) {
  server.create('post', { title: 'Test post' });
  server.create('post', { title: 'Another post' });
  let querySet = new QuerySet(this.store, 'post', {});

  await querySet.query();

  assert.equal(querySet.records.get('length'), 2);
  assert.equal(querySet.records.get('firstObject.title'), 'Test post');
});

test('reload should update the record set', async function(assert) {
  server.create('post', { title: 'Test post' });
  server.create('post', { title: 'Another post' });
  let querySet = new QuerySet(this.store, 'post', {});

  await querySet.query();
  server.create('post', { title: 'A third post' });
  await querySet.reload();

  assert.equal(querySet.records.get('length'), 3);
  assert.equal(querySet.records.get('lastObject.title'), 'A third post');
});

test('records that no longer exist in an update should be removed from the record set', async function(assert) {
  let post = server.create('post', { title: 'Test post' });
  server.create('post', { title: 'Another post' });
  let querySet = new QuerySet(this.store, 'post', {});

  await querySet.query();
  post.destroy();
  await querySet.reload();

  assert.equal(querySet.records.get('length'), 1);
  assert.equal(querySet.records.get('firstObject.title'), 'Another post');
});

test('the record set should not contain records that were not part of the query', async function(assert) {
  server.logging = true;
  server.create('post', { title: 'Test post' });
  server.create('post', { title: 'Another post' });
  let querySet1 = new QuerySet(this.store, 'post', { filter: { slug: 'test-post' } });
  let querySet2 = new QuerySet(this.store, 'post', { filter: { slug: 'another-post' } });

  await querySet1.query();
  await querySet2.query();

  assert.equal(querySet1.records.get('length'), 1);
  assert.equal(querySet1.records.get('firstObject.title'), 'Test post');
  assert.equal(querySet2.records.get('length'), 1);
  assert.equal(querySet2.records.get('firstObject.title'), 'Another post');
});

test('the contain records array instance should not change between fetches', async function(assert) {
  server.create('post', { title: 'Test post' });
  let querySet = new QuerySet(this.store, 'post', {});

  await querySet.query();
  let firstRecordSet = querySet.records;

  server.create('post', { title: 'A third post' });

  await querySet.query();
  let secondRecordSet = querySet.records;

  assert.equal(firstRecordSet, secondRecordSet);
});
