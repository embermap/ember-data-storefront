import { module, test } from 'qunit';
import { visit, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import startMirage from 'dummy/tests/helpers/start-mirage';

module('Acceptance | load relationship', function (hooks) {
  setupApplicationTest(hooks);
  startMirage(hooks);

  test('the load demo works', async function (assert) {
    await visit('/docs/guides/working-with-relationships');

    await click('[data-test-id=load-comments]');

    assert
      .dom('[data-test-id=load-comments-count]')
      .hasText('The post has 3 comments.');
  });

  test('the sideload demo works', async function (assert) {
    await visit('/docs/guides/working-with-relationships');

    await click('[data-test-id=sideload-comments]');

    assert
      .dom('[data-test-id=sideload-comments-count]')
      .hasText('The post has 5 comments.');
  });
});
