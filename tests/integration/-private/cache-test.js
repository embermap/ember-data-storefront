import { module, test } from 'ember-qunit';
import Cache from 'ember-data-storefront/-private/cache';
import RecordQuery from 'ember-data-storefront/-private/record-query';

module('Integration | Cache test');

const mockStore = {};

test('it can store a query with no params', function(assert) {
  let cache = new Cache();
  let query = new RecordQuery(mockStore, 'post', 1);

  cache.putRecordQuery(query);

  assert.equal(cache.getRecordQuery('post', 1), query);
});

test('it can store a query with simple params', function(assert) {
  let cache = new Cache();
  let query = new RecordQuery(mockStore, 'post', 1, {
    testing: 123
  });

  cache.putRecordQuery(query);

  assert.equal(cache.getRecordQuery('post', 1, { testing: 123 }), query);
});

test("the order of the params doesn't matter", function(assert) {
  let cache = new Cache();
  let query = new RecordQuery(mockStore, 'post', 1, {
    key1: 'A',
    key2: 'B'
  });

  cache.putRecordQuery(query);

  let cachedQuery = cache.getRecordQuery('post', 1, {
    key2: 'B',
    key1: 'A'
  });
  assert.equal(cachedQuery, query);
});

test('it can store a query with nested params', function(assert) {
  let cache = new Cache();
  let query = new RecordQuery(mockStore, 'post', 1, {
    filter: {
      testing: 123
    }
  });

  cache.putRecordQuery(query);

  assert.equal(cache.getRecordQuery('post', 1, { filter: { testing: 123 } }), query);
});

test('it can store a query with boolean params', function(assert) {
  let cache = new Cache();
  let query = new RecordQuery(mockStore, 'post', 1, {
    foo: true,
    bar: false
  });

  cache.putRecordQuery(query);

  assert.equal(cache.getRecordQuery('post', 1, { foo: true, bar: false }), query);
});
