import Route from '@ember/routing/route';

export default class FindAllPostsRoute extends Route {
  model() {
    return this.store.findAll('post', { include: 'comments' });
  }
}
