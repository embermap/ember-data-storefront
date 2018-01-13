import Cache from 'ember-data-storefront/-private/cache';
import Strategies from 'ember-data-storefront/-private/strategies';

class Coordinator {
  constructor(queryArrayClass) {
    this.queryArrayClass = queryArrayClass;
    this.cache = new Cache();
  }

  query(store, type, params) {
    let query = this.cache.getRecordArrayQuery(type, params);

    if (!query) {
      query = new this.queryArrayClass(store, type, params);
      this.cache.putRecordArrayQuery(query);
    }

    return query;
  }
}

export default class RecordArrays {
  constructor() {
    this.coordinators = {};
  }

  strategy(name) {
    let coordinator = this.coordinators[name];

    if (!coordinator) {
      coordinator = new Coordinator(Strategies[`${name}Array`]);
      this.coordinators[name] = coordinator;
    }

    return coordinator;
  }
}
