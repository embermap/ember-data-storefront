export default class RecordQuery {

  /**
    The latest result of the query.

    @public
    @property value
  */
  constructor(store, type, id, params) {
    this.store = store;
    this.type = type;
    this.id = id;
    this.params = params;

    this.value = null;
  }

  /**
    Execute the query against the network.

    @public
    @method run
  */
  run() {
    let options = Object.assign({ reload: true }, this.params);

    return this.store.findRecord(this.type, this.id, options)
      .then(record => {
        this.value = record;

        return record;
      });
  }

}
