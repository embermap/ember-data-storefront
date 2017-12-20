import Cache from './cache';
import RecordQuery from './record-query';
import { get } from '@ember/object';

export default class Coordinator {

  constructor(store) {
    this.store = store;
    this.cache = new Cache();

    // A materialized view of the cache's queries that have loaded includes
    this.loadedIncludes = {};
  }

  queryFor(type, id, params) {
    let query = this.cache.get(type, id, params);

    if (!query) {
      query = this._assembleQuery(type, id, params);
      this._rememberQuery(query);
    }

    return query;
  }

  // Private

  _assembleQuery(type, id, params) {
    let query = new RecordQuery(this.store, type, id, params);

    if (this._queryValueCanBeDerived(query)) {
      query.value = this.store.peekRecord(type, id);
    }

    return query;
  }

  _queryValueCanBeDerived(query) {
    let queryKeys = Object.keys(query.params);
    if (queryKeys.length === 1 && queryKeys[0] === 'include') {
      let nonLoadedIncludes = this._nonLoadedIncludesForQuery(query);

      return !nonLoadedIncludes.length;
    }
  }

  _nonLoadedIncludesForQuery(query) {
    let loadedIncludes = get(this, `loadedIncludes.${query.type}.${query.id}`) || [];
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

  _rememberQuery(query) {
    this.cache.put(query);
    this._updateLoadedIncludesWithQuery(query);
  }

  _updateLoadedIncludesWithQuery(query) {
    this.loadedIncludes[query.type] = this.loadedIncludes[query.type] || {};
    this.loadedIncludes[query.type][query.id] = this.loadedIncludes[query.type][query.id] || [];

    let currentIncludes = this.loadedIncludes[query.type][query.id];
    let nonLoadedIncludes = this._nonLoadedIncludesForQuery(query);
    let newLoadedIncludes = [...currentIncludes, ...nonLoadedIncludes];

    this.loadedIncludes[query.type][query.id] = newLoadedIncludes;
  }

}
