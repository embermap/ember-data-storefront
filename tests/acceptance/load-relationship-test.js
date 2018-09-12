import { module, test } from 'qunit';
import { visit, click, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import startMirage from 'dummy/tests/helpers/start-mirage';

module('Acceptance | load relationship', function(hooks) {
  setupApplicationTest(hooks);
  startMirage(hooks);

  test('the load demo works', async function(assert) {
    await visit('/docs/guides/working-with-relationships');

    await click('[data-test-id=load-comments]');

    assert.equal(
      find('[data-test-id=load-comments-count]').textContent.trim(),
      "The post has 3 comments."
    );
  });

  test('the reloadWith demo works', async function(assert) {
    await visit('/docs/guides/working-with-relationships');

    await click('[data-test-id=reload-with-comments]');

    assert.equal(
      find('[data-test-id=reload-with-comments-count]').textContent.trim(),
      "The post has 5 comments."
    );
  });
});
