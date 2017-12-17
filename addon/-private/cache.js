import RecordQuery from './record-query';
import { get } from '@ember/object';
/*
  this.records looks like
    {
      post: {
        '1': {
          loadedIncludes: [],
          fetchedParams: {
            '?include=foo': true,
            '?include=foo&page=1': true,
            '?include=foo&page=1': true,
          ]
        }
      }
    }

  this.collections looks like
    {
      post: {
        loadedIncludes: [],
        fetchedParams: {
          '?include=foo': QuerySet,
          '?include=foo&page=1': QuerySet,
        ]
      }
    }
*/
export default class Cache {

  constructor(store) {
    this.store = store;
    this.recordQueries = {};
  }

  queryFor(type, id, params) {
    let query = this.getQuery(type, id, params);

    if (!query) {
      query = new RecordQuery(this.store, type, id, params);
      if (this._queryIsIncludesOnlyAndIncludesHaveBeenLoaded(query)) {
        this._updateQueryWithKnownValue(query);
      }
      this.putQuery(query);
    }

    return query;
  }

  getQuery(type, id, params) {
    let key = this.keyForParams(params);
    let fetchedQueries = get(this.recordQueries, `${type}.${id}.fetchedQueries`) || {};
    let fetchedQuery = fetchedQueries[key];

    return fetchedQuery;
  }

  putQuery(query) {
    this._setupCacheForQuery(query);
    this._addQueryToCache(query);
    this._updateLoadedIncludesWithQuery(query);
  }

  keyForParams(params) {
    return this._serializeParams(params);
  }

  _serializeParams(params={}, prefix) {
    const query = Object.keys(params).map((key) => {
      const value  = params[key];

      if (params.constructor === Array) {
        key = `${prefix}[]`;
      } else if (params.constructor === Object) {
        key = (prefix ? `${prefix}[${key}]` : key);
      }

      if (typeof value === 'object') {
        return this._serializeParams(value, key);
      } else {
        return `${key}=${encodeURIComponent(value)}`;
      }
    });

    return [].concat.apply([], query).join('&');
  }

  _setupCacheForQuery(query) {
    let defaultCache = { loadedIncludes: [], fetchedQueries: {} };
    this.recordQueries[query.type] = this.recordQueries[query.type] || {};
    this.recordQueries[query.type][query.id] = this.recordQueries[query.type][query.id] || defaultCache;
  }

  _addQueryToCache(query) {
    let key = this.keyForParams(query.params);

    this.recordQueries[query.type][query.id].fetchedQueries[key] = query;
  }

  _updateLoadedIncludesWithQuery(query) {
    let currentIncludes = this.recordQueries[query.type][query.id].loadedIncludes;
    let nonLoadedIncludes = this._nonLoadedIncludesForQuery(query);
    let newLoadedIncludes = [...currentIncludes, ...nonLoadedIncludes];

     this.recordQueries[query.type][query.id].loadedIncludes = newLoadedIncludes;
  }

  _nonLoadedIncludesForQuery(query) {
    let loadedIncludes = get(this, `recordQueries.${query.type}.${query.id}.loadedIncludes`) || [];
    let includesString = query.params.include || '';

    return includesString
      .split(',')
      .filter(include => !!include)
      .filter(include => {
        return !loadedIncludes.find(loadedInclude => {
          return loadedInclude.indexOf(include) === 0;
        })
      });
  }

  _queryIsIncludesOnlyAndIncludesHaveBeenLoaded(query) {
    let queryKeys = Object.keys(query.params);
    if (queryKeys.length === 1 && queryKeys[0] === 'include') {
      let nonLoadedIncludes = this._nonLoadedIncludesForQuery(query);

      return !nonLoadedIncludes.length;
    }
  }

  _loadedIncludesFor(type, id) {
    return get(this.records, `${type}.${id}.loadedIncludes`) || [];
  }

  _updateQueryWithKnownValue(query) {
    query.value = this.store.peekRecord(query.type, query.id);
  }

//   _updateLoadedIncludes(hash, params) {
//     let loadedIncludes = hash.loadedIncludes;
//     let includesString = params.include || '';
//     let nonLoadedIncludes = this._getNonLoadedIncludes(includesString, loadedIncludes);
//
//     hash.loadedIncludes = [...hash.loadedIncludes, ...nonLoadedIncludes];
//     return hash;
//   }
//
//   _loadedIncludesFor(type, id) {
//     return get(this.records, `${type}.${id}.loadedIncludes`) || [];
//   }
//
//   _getNonLoadedIncludes(includesString, loadedIncludes) {
//     return includesString
//       .split(',')
//       .filter(include => !!include)
//       .filter(include => {
//         return !loadedIncludes.find(loadedInclude => {
//           return loadedInclude.indexOf(include) === 0;
//         })
//       });
//   }

}

// export class Foo {
//
//   constructor(store) {
//     this.store = store;
//     this.records = {};
//     this.collections = {};
//   }
//
//   collectionFor(type, params={}) {
//     let key = this._serializeParams(params);
//     let collectionCache = get(this.collections, `${type}.fetchedParams`);
//
//     if (collectionCache) {
//       return collectionCache[key];
//     }
//   }
//
//   putCollectionFor(type, params={}, querySet) {
//     let key = this._serializeParams(params);
//     let collectionCache = this.collections[type] || { loadedInclude: [], fetchedParams: {} };
//     collectionCache.fetchedParams[key] = querySet;
//
//     this.collections[type] = collectionCache;
//   }
//
//   recordFor(type, id, params={}) {
//     if (this._hasRecordFor(type, id, params)) {
//       return this.store.peekRecord(type, id);
//     }
//   }
//
//   putRecordFor(type, id, params={}) {
//     let key = this._serializeParams(params);
//     let recordCache = this.records[type] || {};
//
//     recordCache[id] = recordCache[id] || { loadedIncludes: [], fetchedParams: {} };
//     recordCache[id].fetchedParams = recordCache[id].fetchedParams || {};
//     recordCache[id].fetchedParams[key] = true;
//     recordCache[id] = this._updateLoadedIncludes(recordCache[id], params);
//
//     this.records[type] = recordCache;
//   }
//
//   _hasRecordFor(type, id, params) {
//     let queryHasBeenFetched = this._queryHasBeenFetched(type, id, params);
//     let queryIsIncludesOnlyAndHasBeenLoaded = this._queryIsIncludesOnlyAndHasBeenLoaded(type, id, params);
//
//     return queryHasBeenFetched || queryIsIncludesOnlyAndHasBeenLoaded;
//   }
//
//   _queryHasBeenFetched(type, id, params) {
//     let key = this._serializeParams(params);
//     let fetchedParams = get(this.records, `${type}.${id}.fetchedParams`) || {};
//
//     return fetchedParams[key];
//   }
//
//   _queryIsIncludesOnlyAndHasBeenLoaded(type, id, params) {
//     let queryKeys = Object.keys(params);
//     if (queryKeys.length === 1 && queryKeys[0] === 'include') {
//       let includesString = params.include;
//       let loadedIncludes = this._loadedIncludesFor(type, id);
//       let nonLoadedIncludes = this._getNonLoadedIncludes(includesString, loadedIncludes);
//
//       return !nonLoadedIncludes.length;
//     }
//   }
//
//   _keyForCollection(type, params={}) {
//     return `${type}:${this._serializeParams(params)}`;
//   }
//
//   _serializeParams(params={}, prefix) {
//     const query = Object.keys(params).map((key) => {
//       const value  = params[key];
//
//       if (params.constructor === Array) {
//         key = `${prefix}[]`;
//       } else if (params.constructor === Object) {
//         key = (prefix ? `${prefix}[${key}]` : key);
//       }
//
//       if (typeof value === 'object') {
//         return this._serializeParams(value, key);
//       } else {
//         return `${key}=${encodeURIComponent(value)}`;
//       }
//     });
//
//     return [].concat.apply([], query).join('&');
//   }
//
//   _updateLoadedIncludes(hash, params) {
//     let loadedIncludes = hash.loadedIncludes;
//     let includesString = params.include || '';
//     let nonLoadedIncludes = this._getNonLoadedIncludes(includesString, loadedIncludes);
//
//     hash.loadedIncludes = [...hash.loadedIncludes, ...nonLoadedIncludes];
//     return hash;
//   }
//
//   _loadedIncludesFor(type, id) {
//     return get(this.records, `${type}.${id}.loadedIncludes`) || [];
//   }
//
//   _getNonLoadedIncludes(includesString, loadedIncludes) {
//     return includesString
//       .split(',')
//       .filter(include => !!include)
//       .filter(include => {
//         return !loadedIncludes.find(loadedInclude => {
//           return loadedInclude.indexOf(include) === 0;
//         })
//       });
//   }
// }
