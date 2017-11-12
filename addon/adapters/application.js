import JSONAPIAdapter from 'ember-data/adapters/json-api';

export default JSONAPIAdapter.extend({
  init() {
    this._super(...arguments);

    this.set('hasEverLoadedAll', {});
  },

  shouldBackgroundReloadAll(store, snapshot) {
    return true;
  },

  shouldReloadAll(store, snapshotRecordArray) {
    let key = snapshotRecordArray.type.toString();

    if (!this.get('hasEverLoadedAll')[key]) {
      this.get('hasEverLoadedAll')[key] = true;
      return true;
    } else {
      return false;
    }
  }

});
