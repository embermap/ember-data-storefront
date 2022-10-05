/*eslint no-console: ["error", { allow: ["log"] }] */

export default function (server) {
  window.server = server;

  server.create('post', {
    id: 1,
    title: 'Lorem',
    comments: server.createList('comment', 3),
  });

  server.create('post', {
    id: 2,
    title: 'Lorem',
    comments: server.createList('comment', 5),
  });

  server.create('post', { title: 'Ipsum' });
  server.create('post', { title: 'Dolor' });
  // server.createList('post', 3);
  //
  // let interval = setInterval(() => {
  //   console.log('[Mirage scenario] Creating a new post');
  //
  //   server.create('post');
  //
  //   if (server.db.posts.length >= 10) {
  //     clearInterval(interval);
  //   }
  // }, 1000);
}
