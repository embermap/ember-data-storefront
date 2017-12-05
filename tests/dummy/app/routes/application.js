import Ember from 'ember';

export default Ember.Route.extend({
  storefront: Ember.inject.service(),

  model: function() {
    return Ember.RSVP.hash({
      allPosts: this.get('storefront').loadAll('post')
    });
  }
});
