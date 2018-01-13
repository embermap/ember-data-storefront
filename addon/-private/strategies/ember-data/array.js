import { resolve } from 'rsvp';
import { ago } from 'ember-data-storefront/-private/utils/time';

export default class EmberDataRecordArray {

  constructor(store, type, params) {
    this.store = store;
    this.type = type;
    this.params = params;

    this.lastRun = null;
    this.value = null;
  }

  run() {
    let promise;
    let expires = this.params.expires;
    let isFresh = this.value && expires && this.lastRun && ago(expires).isBefore(this.lastRun);
    let isStale = expires && !isFresh;

    if (isFresh) {
      promise = resolve(this.value);

    } else if (this.value) {
      let shouldBlock = isStale ||
        this.params.reload ||
        !this.store.adapterFor(this.type).shouldBackgroundReloadAll(this.store, this.value);

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
}
