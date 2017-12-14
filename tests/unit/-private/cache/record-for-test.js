import { module, test } from 'ember-qunit';
import Cache from 'ember-data-storefront/-private/cache';

module('Unit | Cache | #recordFor');

let mockStore = {
  peekRecord() {
    return true;
  }
}

test('it will return nothing if a record is not in the cache', function(assert) {
  let mockStore = {
    peekRecord() {
      return true;
    }
  }
  let cache = new Cache(mockStore);
  cache.records = {};

  let model = cache.recordFor('post', 1);

  assert.notOk(model);
});

test('it will return a record if its in the cache', function(assert) {
  let cache = new Cache(mockStore);
  cache.records = {
    post: {
      1: {
        loadedIncludes: [],
        fetchedParams: {
          '': true
        }
      }
    }
  };

  let model = cache.recordFor('post', 1);

  assert.ok(model);
});

test('it will return a record with a query if its in the cache', function(assert) {
  let cache = new Cache(mockStore);
  cache.records = {
    post: {
      1: {
        loadedIncludes: [],
        fetchedParams: {
          'testing=123': true
        }
      }
    }
  };

  let model = cache.recordFor('post', 1, {
    testing: 123
  });

  assert.ok(model);
});

test('it will not return a record with a query if its not in the cache', function(assert) {
  let cache = new Cache(mockStore);
  cache.records = {
    post: {
      1: {
        loadedIncludes: [],
        fetchedParams: {
          '': true
        }
      }
    }
  };

  let model = cache.recordFor('post', 1, {
    testing: 123
  });

  assert.notOk(model);
});

test('it will return a record with an includes-only query if all includes have been loaded, even if the query has never been fetched', function(assert) {
  let cache = new Cache(mockStore);
  cache.records = {
    post: {
      1: {
        loadedIncludes: ['comments', 'author'],
        fetchedParams: {
          'include=comments': true,
          'include=author': true,
        }
      }
    }
  };

  let model = cache.recordFor('post', 1, {
    include: 'comments,author'
  });

  assert.ok(model);
});
