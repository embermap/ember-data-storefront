import Ember from 'ember';

export default Ember.Mixin.create({
  storefront: Ember.inject.service(),

  init() {
    this._super(...arguments);

    this.set('loadedIncludes', []);
  },

  load(...includes) {
    let modelName = this.constructor.modelName;
    let includesString = includes.join(',');
    let nonLoadedIncludes = this._getNonLoadedIncludes(includesString);

    this.set('loadedIncludes', [...nonLoadedIncludes, ...this.get('loadedIncludes')]);

    // return this.get('storefront').loadRecord(modelName, this.get('id'), {
    //   include: includesString,
    // });

    return this.store.findRecord(modelName, this.get('id'), {
      include: includesString,
      reload: nonLoadedIncludes.length
    });
  },

  _getNonLoadedIncludes(includesString) {
    return includesString
      .split(',')
      .filter(include => {
        return !this.get('loadedIncludes').find(loadedInclude => {
          return loadedInclude.indexOf(include) === 0;
        })
      });
  },

  hasLoaded(includesString) {
    let nonLoadedIncludes = this._getNonLoadedIncludes(includesString);

    return !nonLoadedIncludes.length;
  }

});
