let genericRelationshipRouteHandler = function (schema, request) {
  let collectionName = request.url.split('/').filter((part) => part !== '')[0];
  let relationship = request.params.relationship;
  let modelOrCollection = schema[collectionName].find(request.params.id)[
    relationship
  ];

  if (modelOrCollection) {
    return modelOrCollection;
  } else {
    return { data: null };
  }
};

export default function () {
  window.server = this;

  this.get('posts', {
    timing: 1000,
  });

  this.get('/posts/:id');

  this.get(
    '/posts/:id/relationships/:relationship',
    genericRelationshipRouteHandler
  );

  this.passthrough();
}
