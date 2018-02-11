/* eslint-env node */

const FastBoot = require('fastboot');
const { execFileSync } = require('child_process');
const { module: Qmodule, test } = require('qunit');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const postsRouter = require('../server/mocks/posts');
const express = require('express');

// build the application
execFileSync('node', ['./node_modules/.bin/ember', 'build']);

let visitOptions = {
  request: { headers: { host: 'localhost:4201' } }
};

Qmodule('Fastboot', function(hooks) {
  let fastboot;
  let server;

  hooks.before(async function() {
    fastboot = new FastBoot({
      distPath: 'dist',
      resilient: false
    });

    let app = express();
    postsRouter(app);
    server = app.listen(4201);
  });

  hooks.after(async function() {
    server.close();
  });

  test('A fastboot rendered app should display data fetched by the server', async function(assert) {
    let page = await fastboot.visit('/fastboot-tests', visitOptions);
    let html = await page.html();
    let dom = new JSDOM(html);
    let post1 = dom.window.document.querySelector('[data-test-id=post-1]');

    assert.equal(post1.textContent.trim(), 'Hello from Ember CLI HTTP Mocks');
  });

  test('A fastboot rendered app should put storefront queries in the shoebox', async function(assert) {
    let page = await fastboot.visit('/fastboot-tests', visitOptions);
    let html = await page.html();
    let dom = new JSDOM(html);

    let shoebox = dom.window.document
      .querySelector('#shoebox-ember-data-storefront')
      .textContent;

    let cache = JSON.parse(shoebox);
    let keys = Object.keys(cache.queries);

    assert.equal(keys.length, 1);
    assert.ok(cache.queries['post::filter[popular]=true']);
  });

});
