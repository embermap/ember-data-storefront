import { module, test } from 'qunit';
import { visit, click, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';

module('Acceptance | load relationship', function(hooks) {
  let server;

  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    server = startMirage();
  });

  hooks.afterEach(function() {
    server.shutdown();
  });

  test('visiting /load-relationship', async function(assert) {
    let post = server.create('post', { id: '1', title: 'Post 1 title' });
    server.createList('comment', 3, { post });

    await visit('/docs/guides/working-with-relationships');

    await click('[data-test-id=load-comments]');

    assert.equal(
      find('[data-test-id=comments-count]').textContent.trim(),
      "The post has 3 comments."
    );
  });
});
