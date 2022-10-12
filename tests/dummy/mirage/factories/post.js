import { dasherize } from '@ember/string';
import { Factory, trait } from 'ember-cli-mirage';

export default Factory.extend({
  title(i) {
    return `The title for post #${i + 1}`;
  },

  text: 'This is the text of the post.',

  afterCreate(post) {
    post.update({ slug: dasherize(post.title) });
  },

  withComments: trait({
    afterCreate(post, server) {
      server.createList('comment', 3, { post });
    },
  }),
});
