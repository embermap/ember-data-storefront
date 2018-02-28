import { module, test } from 'qunit';
import { visit, click, find } from "@ember/test-helpers";
import { setupApplicationTest } from 'ember-qunit';
import { waitFor } from 'ember-wait-for-test-helper/wait-for';

function t(...args) {
  return args
    .map(arg => `[data-test-id="${arg}"]`)
    .join(' ');
}

async function domHasChanged(selector) {
  let previousUi = find(selector).textContent;
  return await waitFor(() => {
    let currentUi = find(selector).textContent;

    return currentUi !== previousUi;
  })
}

module('Acceptance | load all', function(hooks) {
  setupApplicationTest(hooks);

  test('visiting /load-all', async function(assert) {
    server.create('post', { id: '1', title: 'Post 1 title' });
    server.create('post');

    await visit('/docs/guides/data-fetching');

    // Click post1-link, see loading, then see post1
    click(t('demo2', 'post1-link'));
    await domHasChanged(t('demo2', 'app-ui'));
    assert.equal(find(t('demo2', 'app-ui')).textContent.trim(), 'Loading /posts/1...');

    await domHasChanged(t('demo2', 'app-ui'));
    assert.equal(find(t('demo2', 'app-ui')).textContent.trim(), 'Post 1 title');

    // Click posts-link, see loading, then see list
    click(t('demo2', 'posts-link'));
    await domHasChanged(t('demo2', 'app-ui'));
    assert.equal(find(t('demo2', 'app-ui')).textContent.trim(), 'Loading /posts...');

    await domHasChanged(t('demo2', 'app-ui'));
    assert.equal(find(t('demo2', 'app-ui')).querySelectorAll('li').length, 2);

    // Click posts1-link again, and only see post1 (no loading)
    click(t('demo2', 'post1-link'));
    await domHasChanged(t('demo2', 'app-ui'));
    assert.equal(find(t('demo2', 'app-ui')).textContent.trim(), 'Post 1 title');
  });
});
