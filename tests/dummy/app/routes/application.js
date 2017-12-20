import Ember from 'ember';

export default Ember.Route.extend({

  model() {
    return this.get('storefront').loadRecord('post', 1);

    // return Ember.RSVP.hash({
    //   allPosts: this.get('storefront').loadAll('post')
    // });
  }

});
