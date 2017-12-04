import { Factory } from 'ember-cli-mirage';
import Ember from 'ember';

export default Factory.extend({
  title(i) {
    return `The title for post #${i + 1}`;
  },

  text: "This is the text of the post.",

  afterCreate(post) {
    post.update({ slug: Ember.String.dasherize(post.title) });
  }
});
