import Route from '@ember/routing/route';

export default class PlaygroundRoute extends Route {
  model() {
    return this.store.loadRecord('post', 1);
  }
}
