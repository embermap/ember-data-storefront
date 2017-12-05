import Ember from 'ember';

export default Ember.Controller.extend({
  storefront: Ember.inject.service(),

  actions: {
    reloadAllPosts() {
      this.get('storefront').loadAll('post');
    }
  }
});
