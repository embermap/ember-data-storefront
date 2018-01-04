import Ember from 'ember';

export default Ember.Mixin.create({

  storefront: Ember.inject.service(),

  load(...includes) {
    let modelName = this.constructor.modelName;

    return this.get('storefront').findRecord(modelName, this.get('id'), {
      include: includes.join(',')
    });
  },

  hasLoaded(includesString) {
    let modelName = this.constructor.modelName;

    return this.get('storefront').hasLoadedIncludesForRecord(modelName, this.get('id'), includesString);
  }

});
