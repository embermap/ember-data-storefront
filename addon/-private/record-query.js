export default class RecordQuery {

  constructor(store, type, id, params) {
    this.store = store;
    this.type = type;
    this.id = id;
    this.params = params;

    this._value = null;
  }

  /**
    The latest result of the query.

    @property value
  */
  get value() {
    return this._value;
  }

  set value(value) {
    this._value = value;
  }

  run() {
    let options = Object.assign({ reload: true }, this.params);

    return this.store.findRecord(this.type, this.id, options)
      .then(record => {
        this._value = record;

        return record;
      });
  }

}
