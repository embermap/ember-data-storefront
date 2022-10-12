import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class PlaygroundController extends Controller {
  get post() {
    return this.model;
  }

  get comments() {
    return this.post.hasMany('comments').value();
  }

  @action createServerComment() {
    server.create('comment', { postId: this.post.id });
  }

  @action async loadComments() {
    let returnValue = await this.post.load('comments');
    if (!this.returnValue) {
      this.returnValue = returnValue;
    }
  }

  @action makeSiteSlow() {
    server.timing = 5000;
  }
}
