import { get } from '@ember/object';
import RecordQuery from './record-query';

/*
  A cache for queries.
*/
export default class Cache {

  constructor() {
    this.recordQueries = {};
    this.recordArrayQueries = {};
  }

  getRecordQuery(type, id, params={}) {
    let key = this._keyForParams(params);
    let recordQueries = get(this.recordQueries, `${type}.${id}`) || {};

    return recordQueries[key];
  }

  getRecordArrayQuery(type, params={}) {
    let key = this._keyForParams(params);
    let recordArrayQueries = get(this.recordArrayQueries, `${type}`) || {};

    return recordArrayQueries[key];
  }

  putRecordQuery(query) {
    this._setupCacheForQuery(query);
    this._addQueryToCache(query);
  }

  putRecordArrayQuery(query) {
    this._setupCacheForQuery(query);
    this._addQueryToCache(query);
  }

  // Private

  _keyForParams(params) {
    return this._serializeParams(params);
  }

  _serializeParams(params={}, prefix) {
    const query = Object.keys(params)
      .sort()
      .map((key) => {
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
    if (query instanceof RecordQuery) {
      this.recordQueries[query.type] = this.recordQueries[query.type] || {};
      this.recordQueries[query.type][query.id] = this.recordQueries[query.type][query.id] || {};
    } else {
      this.recordArrayQueries[query.type] = this.recordArrayQueries[query.type] || {};
    }
  }

  _addQueryToCache(query) {
    let key = this._keyForParams(query.params);

    if (query instanceof RecordQuery) {
      this.recordQueries[query.type][query.id][key] = query;
    } else {
      this.recordArrayQueries[query.type][key] = query;
    }
  }

}
