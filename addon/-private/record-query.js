import { assign } from '@ember/polyfills';

export default class RecordQuery {

  constructor(store, type, id, params) {
    this.store = store;
    this.type = type;
    this.id = id;
    this.params = params;

    this.value = null;
  }

  run() {
    // If the query has params, we force a reload, since Ember Data treats all
    // findRecords the same.
    let hasParams = Object.keys(this.params).length > 0;
    let options = assign(
      { reload: hasParams },
      this.params
    );

    return this.store.findRecord(this.type, this.id, options)
      .then(record => {
        this.value = record;

        return record;
      });
  }

}
