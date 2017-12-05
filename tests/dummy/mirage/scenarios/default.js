/*eslint no-console: ["error", { allow: ["log"] }] */

export default function(server) {
  server.createList('post', 3);

  let interval = setInterval(() => {
    console.log('[Mirage scenario] Creating a new post');

    server.create('post');

    if (server.db.posts.length >= 10) {
      clearInterval(interval);
    }
  }, 1000);
}
