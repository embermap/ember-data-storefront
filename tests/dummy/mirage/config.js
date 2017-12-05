export default function() {
  this.get('posts', function(schema, request) {
    let filters = {};

    if (request.queryParams['filter[slug]']) {
      filters.slug = request.queryParams['filter[slug]'];
    }

    return schema.posts.where(filters);
  });

  this.get('/posts/:id');
}
