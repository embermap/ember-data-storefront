import Route from '@ember/routing/route';

export default Route.extend({
  model: function() {
    return this.store.loadAll('post', { filter: { popular: true }});
  },
});
