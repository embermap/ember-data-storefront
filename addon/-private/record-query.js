export default class RecordQuery {
  constructor(store, type, id, params = {}) {
    this.store = store;
    this.type = type;
    this.id = id;
    this.params = params;

    // if we have no params, we can use the model from
    // the store if it exists, nice lil shortcut here.
    this.value =
      Object.keys(this.params).length === 0
        ? this.store.peekRecord(type, id)
        : null;
  }

  run() {
    // if we're running a query in storefront we always want
    // a blocking promise, so we force reload true.
    let options = { ...{ reload: true }, ...this.params };

    return this.store.findRecord(this.type, this.id, options).then((record) => {
      this.value = record;

      return record;
    });
  }
}
