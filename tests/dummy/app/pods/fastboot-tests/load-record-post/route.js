import Route from '@ember/routing/route';

export default class LoadRecordPostRoute extends Route {
  model() {
    return this.store.loadRecord('post', 1);
  }
}
