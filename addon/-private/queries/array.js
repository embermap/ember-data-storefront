import { resolve } from 'rsvp';
import { ago } from 'ember-data-storefront/-private/utils/time';

export default class ArrayQuery {

  constructor(store, type, params, strategy) {
    this.store = store;
    this.type = type;
    this.params = params;
    this.strategy = strategy;

    this.lastRun = null;
    this.value = null;
  }

  run() {
    let promise;

    if (this.isFresh()) {
      promise = resolve(this.value);

    } else if (this.value) {
      let shouldBlock = this.strategy && this.strategy.shouldBlockReload(this);

      // still refetch the query
      let refetch = this.value.update()
        .then(records => {
          this.lastRun = new Date();
          return records;
        });

      // but only set it to the promise if we want to block
      promise = shouldBlock ? refetch : resolve(this.value);

    } else {
      promise = this.store.query(this.type, this.params)
        .then(records => {
          this.value = records;
          this.lastRun = new Date();
          return records;
        });
    }

    return promise
  }

  isFresh() {
    let expires = this.params.expires;
    let lastRun = this.lastRun;

    return this.value &&
      lastRun &&
      expires &&
      expires !== "immediately" &&
      (expires === "never" || ago(expires).isBefore(lastRun));
  }

  isStale() {
    return this.params.expires && !this.isFresh();
  }
}
