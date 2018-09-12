import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({

  links(model) {
    return {
      author: {
        related: `/posts/${model.id}/relationships/author`
      },
      comments: {
        related: `/posts/${model.id}/relationships/comments`
      }
    };
  }

});
