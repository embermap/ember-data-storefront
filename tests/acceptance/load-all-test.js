import { test } from 'qunit';
import { waitFor } from 'ember-wait-for-test-helper/wait-for';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | load all');

function t(...args) {
  return args
    .map(arg => `[data-test-id="${arg}"]`)
    .join(' ');
}

async function domHasChanged(selector) {
  let previousUi = find(selector).text();
  return await waitFor(() => {
    let currentUi = find(selector).text();

    return currentUi !== previousUi;
  })
}

test('visiting /load-all', async function(assert) {
  server.create('post', { id: '1', title: 'Post 1 title' });
  server.create('post');

  await visit('/docs/guides/storefront');

  // Click post1-link, see loading, then see post1
  click(t('demo2', 'post1-link'));
  await domHasChanged(t('demo2', 'app-ui'));
  assert.equal(find(t('demo2', 'app-ui')).text().trim(), 'Loading /posts/1...');

  await domHasChanged(t('demo2', 'app-ui'));
  assert.equal(find(t('demo2', 'app-ui')).text().trim(), 'Post 1 title');

  // Click posts-link, see loading, then see list
  click(t('demo2', 'posts-link'));
  await domHasChanged(t('demo2', 'app-ui'));
  assert.equal(find(t('demo2', 'app-ui')).text().trim(), 'Loading /posts...');

  await domHasChanged(t('demo2', 'app-ui'));
  assert.equal(find(t('demo2', 'app-ui')).find('li').length, 2);

  // Click posts1-link again, and only see post1 (no loading)
  click(t('demo2', 'post1-link'));
  await domHasChanged(t('demo2', 'app-ui'));
  assert.equal(find(t('demo2', 'app-ui')).text().trim(), 'Post 1 title');
});
