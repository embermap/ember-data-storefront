import DS from 'ember-data';

export default class QuerySet {
  constructor(store, type, params) {
    this.store = store;
    this.type = type;
    this.params = params;

    this.records = DS.AdapterPopulatedRecordArray.create({
      store,
      modelName: type,
      query: params
    })
  }

  query() {
    return this.records.update();
  }

  reload() {
    return this.query();
  }
}
