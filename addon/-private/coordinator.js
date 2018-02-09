import Cache from './cache';
import RecordQuery from './record-query';
import RecordArrayQuery from './record-array-query';
import { get } from '@ember/object';

/*
  I know how to retrieve queries from the cache, and also assemble queries that
  are not in the cache but can be derived from them.
*/
export default class Coordinator {

  constructor(store) {
    this.store = store;
    this.recordCache = new Cache();
    this.arrayCache = new Cache();

    // A materialized view of loaded includes from the cache's queries.
    this.loadedIncludes = {};
  }

  recordQueryFor(type, id, params) {
    let query = this.recordCache.get(type, id, params);

    if (!query) {
      query = this._assembleRecordQuery(type, id, params);
      this._rememberRecordQuery(query);
    }

    return query;
  }

  recordArrayQueryFor(type, params) {
    let query = this.arrayCache.get(type, params);

    if (!query) {
      query = this._assembleRecordArrayQuery(type, params);
      this._rememberRecordArrayQuery(query);
    }

    return query;
  }

  dump() {
    let records = this.recordCache.all();
    let arrays = this.arrayCache.all();

    return records.concat(arrays);
  }

  recordHasIncludes(type, id, includesString) {
    let query = this._assembleRecordQuery(type, id, { include: includesString });
    let nonLoadedIncludes = this._nonLoadedIncludesForQuery(query);

    return nonLoadedIncludes.length === 0;
  }

  // Private

  _assembleRecordQuery(type, id, params) {
    let query = new RecordQuery(this.store, type, id, params);

    if (this._queryValueCanBeDerived(query)) {
      query.value = this.store.peekRecord(type, id);
    }

    return query;
  }

  _assembleRecordArrayQuery(type, params) {
    let query = new RecordArrayQuery(this.store, type, params);

    return query;
  }

  _queryValueCanBeDerived(query) {
    let queryKeys = Object.keys(query.params);
    if (queryKeys.length === 1 && queryKeys[0] === 'include') {
      let nonLoadedIncludes = this._nonLoadedIncludesForQuery(query);

      return nonLoadedIncludes.length === 0;
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

  _rememberRecordQuery(query) {
    this.recordCache.put(query);
    this._updateLoadedIncludesWithQuery(query);
  }

  _rememberRecordArrayQuery(query) {
    this.arrayCache.put(query);
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
