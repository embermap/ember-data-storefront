import Cache from 'ember-data-storefront/-private/cache';
import ArrayQuery from 'ember-data-storefront/-private/queries/array';
import Strategies from 'ember-data-storefront/-private/strategies';

class Coordinator {
  constructor(strategyClass) {
    this.strategyClass = strategyClass;
    this.cache = new Cache();
  }

  query(store, type, params) {
    let query = this.cache.getRecordArrayQuery(type, params);

    if (!query) {
      let strategy = new this.strategyClass();
      query = new ArrayQuery(store, type, params, strategy);
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
      coordinator = new Coordinator(Strategies[`${name}`]);
      this.coordinators[name] = coordinator;
    }

    return coordinator;
  }
}
