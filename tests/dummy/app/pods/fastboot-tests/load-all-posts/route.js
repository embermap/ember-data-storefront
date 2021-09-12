import Route from '@ember/routing/route';

export default class LoadAllPostsRoute extends Route {
  model() {
    return this.store.loadRecords('post', { filter: { popular: true } });
  }
}
