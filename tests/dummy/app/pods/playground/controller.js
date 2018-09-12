import Controller from '@ember/controller';
import { readOnly } from '@ember/object/computed';
import { computed } from '@ember/object';

export default Controller.extend({
  post: readOnly('model'),

  comments: computed('post.comments', function() {
    return this.get('post').hasMany('comments').value();
  }),

  actions: {
    createServerComment() {
      server.create('comment', { postId: this.get('post.id') });
    },

    async loadComments() {
      let returnValue = await this.get('post').load('comments');
      if (!this.get('returnValue')) {
        this.set('returnValue', returnValue);
      }
    },

    makeSiteSlow() {
      server.timing = 5000;
    }
  }
});
