import { get } from '@ember/object';

/*
  A cache for queries.
*/
export default class Cache {

  constructor() {
    this.recordQueries = {};
  }

  get(type, id, params={}) {
    let key = this._keyForParams(params);
    let recordQueries = get(this.recordQueries, `${type}.${id}`) || {};
    let recordQuery = recordQueries[key];

    return recordQuery;
  }

  put(query) {
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
    this.recordQueries[query.type] = this.recordQueries[query.type] || {};
    this.recordQueries[query.type][query.id] = this.recordQueries[query.type][query.id] || {};
  }

  _addQueryToCache(query) {
    let key = this._keyForParams(query.params);

    this.recordQueries[query.type][query.id][key] = query;
  }

}
