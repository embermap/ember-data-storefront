import { moduleFor, test } from 'ember-qunit';

moduleFor('service:storefront', 'Unit | Service | storefront', {
  // Specify the other units that are required for this test.
  //needs: ['service:store']
});

test('_key will generate a blank key for an empty query', function(assert) {
  let query = {};
  let key = "model:";
  assert.equal(this.subject()._key('model', query), key);
});

test('_key will generate a key for a query', function(assert) {
  let query = { testing: 123 };
  let key = "model:testing=123";
  assert.equal(this.subject()._key('model', query), key);
});

test('_key will generate a key for a nested object', function(assert) {
  let query = { filter: { testing: 123 } };
  let key = "model:filter[testing]=123";
  assert.equal(this.subject()._key('model', query), key);
});

test('_key will generate a key for a nested array', function(assert) {
  let query = { testing: [1, 2, 3] };
  let key = "model:testing[]=1&testing[]=2&testing[]=3";
  assert.equal(this.subject()._key('model', query), key);
});

test('_key will generate a key for boolean values', function(assert) {
  let query = { true: true, false: false };
  let key = "model:true=true&false=false";
  assert.equal(this.subject()._key('model', query), key);
});
