import ApplicationSerializer from './application';

export default class PostSerializer extends ApplicationSerializer {
  links(model) {
    return {
      author: {
        related: `/posts/${model.id}/relationships/author`,
      },
      comments: {
        related: `/posts/${model.id}/relationships/comments`,
      },
    };
  }
}
