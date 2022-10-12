import { queryCacheKey, cacheKey } from './utils/get-key';

/*
  A cache for queries.
*/
export default class Cache {
  constructor() {
    this.store = {};
  }

  get(...args) {
    let key = cacheKey(args);
    return this.store[key];
  }

  put(query) {
    let key = queryCacheKey(query);
    this.store[key] = query;
    return query;
  }

  all() {
    return Object.keys(this.store).map((key) => this.store[key]);
  }
}
