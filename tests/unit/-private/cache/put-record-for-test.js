import { module, test } from 'ember-qunit';
import Cache from 'ember-data-storefront/-private/cache';

module('Unit | Cache | #putRecordFor');

test('it will generate a key for an empty query', function(assert) {
  let cache = new Cache();
  cache.putRecordFor('post', 1);

  assert.deepEqual(cache.records, {
    post: {
      1: {
        loadedIncludes: [],
        fetchedParams: {
          '': true
        }
      }
    }
  });
});

test('it will generate a key for a query', function(assert) {
  let cache = new Cache();
  cache.putRecordFor('post', 1, {
    testing: 123
  });

  assert.deepEqual(cache.records, {
    post: {
      1: {
        loadedIncludes: [],
        fetchedParams: {
          'testing=123': true
        }
      }
    }
  });
});

test('it will generate a key for a nested object', function(assert) {
  let cache = new Cache();
  cache.putRecordFor('post', 1, {
    filter: {
      testing: 123
    }
  });

  assert.deepEqual(cache.records, {
    post: {
      1: {
        loadedIncludes: [],
        fetchedParams: {
          'filter[testing]=123': true
        }
      }
    }
  });
});

test('it will generate a key for boolean values', function(assert) {
  let cache = new Cache();
  cache.putRecordFor('post', 1, {
    true: true,
    false: false
  });

  assert.deepEqual(cache.records, {
    post: {
      1: {
        loadedIncludes: [],
        fetchedParams: {
          'true=true&false=false': true
        }
      }
    }
  });
});

test('it saves includes into loadedIncludes', function(assert) {
  let cache = new Cache();
  cache.putRecordFor('post', 1, {
    include: 'comments'
  });

  assert.deepEqual(cache.records, {
    post: {
      1: {
        loadedIncludes: ['comments'],
        fetchedParams: {
          'include=comments': true
        }
      }
    }
  });
});

test('it works when called multipe times with the same includes', function(assert) {
  let cache = new Cache();
  cache.putRecordFor('post', 1, {
    include: 'comments'
  });
  cache.putRecordFor('post', 1, {
    include: 'comments'
  });

  assert.deepEqual(cache.records, {
    post: {
      1: {
        loadedIncludes: ['comments'],
        fetchedParams: {
          'include=comments': true
        }
      }
    }
  });
});

test('it saves multiple includes into loadedIncludes', function(assert) {
  let cache = new Cache();
  cache.putRecordFor('post', 1, {
    include: 'comments,author'
  });

  assert.deepEqual(cache.records, {
    post: {
      1: {
        loadedIncludes: ['comments', 'author'],
        fetchedParams: {
          'include=comments%2Cauthor': true
        }
      }
    }
  });
});

test('multiple calls augments loadedIncludes', function(assert) {
  let cache = new Cache();
  cache.putRecordFor('post', 1, {
    include: 'comments'
  });
  cache.putRecordFor('post', 1, {
    include: 'author'
  });

  assert.deepEqual(cache.records, {
    post: {
      1: {
        loadedIncludes: ['comments', 'author'],
        fetchedParams: {
          'include=comments': true,
          'include=author': true,
        }
      }
    }
  });
});
