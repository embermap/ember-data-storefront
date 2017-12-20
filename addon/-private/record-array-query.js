export default class RecordArrayQuery {

  constructor(store, type, params) {
    this.store = store;
    this.type = type;
    this.params = params;

    /**
      The latest result of the query.

      @public
      @property value
    */
    this.value = null;
  }

  /**
    Execute the query against the network.

    @public
    @method run
  */
  run() {
    let promise;

    if (this.value) {
      promise = this.value.update();

    } else {
      promise = this.store.query(this.type, this.params)
        .then(records => {
          this.value = records;

          return records;
        });
    }

    return promise;
  }

}
