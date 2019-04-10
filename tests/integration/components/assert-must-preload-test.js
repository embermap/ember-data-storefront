import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';
import hbs from 'htmlbars-inline-precompile';
import DS from 'ember-data';
import LoadableModel from 'ember-data-storefront/mixins/loadable-model';
import LoadableStore from 'ember-data-storefront/mixins/loadable-store';
import Ember from 'ember';

module('Integration | Component | assert must preload', function(hooks) {
  setupRenderingTest(hooks);

  // keep an eye on this issue:
  // https://github.com/emberjs/ember-test-helpers/issues/310
  let onerror;
  let adapterException;
  let loggerError;

  hooks.beforeEach(function() {
    DS.Model.reopen(LoadableModel);
    this.store = this.owner.lookup('service:store')
    this.store.reopen(LoadableStore);
    this.store.resetCache();
    this.server = startMirage();
    onerror = Ember.onerror;
    adapterException = Ember.Test.adapter.exception
    loggerError = Ember.Logger.error;

    // the next line doesn't work in 2.x due to an eslint rule
    // eslint-disable-next-line
    [ this.major, this.minor ] = Ember.VERSION.split(".");
  });

  hooks.afterEach(function() {
    Ember.onerror = onerror;
    Ember.Test.adapter.exception = adapterException;
    Ember.Logger.error = loggerError;
    this.server.shutdown();
  });

  test('it errors if the relationship has not yet be loaded', async function(assert) {
    this.server.create('post');
    this.post = await run(() => {
      return this.store.loadRecord('post', 1);
    });

    let assertError = function(e) {
      let regexp = /You tried to render a .+ that accesses relationships off of a post, but that model didn't have all of its required relationships preloaded ('comments')*/;
      assert.ok(e.message.match(regexp));
    };

    if (this.major === "2" && (this.minor === "12" || this.minor === "16")) {
      Ember.Logger.error = function() {};
      Ember.Test.adapter.exception = assertError;
    } else {
      Ember.onerror = assertError;
    }

    await render(hbs`
      {{assert-must-preload post "comments"}}
    `);
  });

  test('it errors if one of the relationships has not yet be loaded', async function(assert) {
    this.server.create('post');
    this.post = await run(() => {
      return this.store.loadRecord('post', 1, { include: 'author' });
    });

    let assertError = function(e) {
      let regexp = /You tried to render a .+ that accesses relationships off of a post, but that model didn't have all of its required relationships preloaded ('comments')*/;
      assert.ok(e.message.match(regexp));
    };

    if (this.major === "2" && (this.minor === "12" || this.minor === "16")) {
      Ember.Logger.error = function() {};
      Ember.Test.adapter.exception = assertError;
    } else {
      Ember.onerror = assertError;
    }

    await render(hbs`
      {{assert-must-preload post "author,comments"}}
    `);
  });

  test('it errors if a nested relationship has not yet be loaded', async function(assert) {
    this.server.create('post');
    this.post = await run(() => {
      return this.store.loadRecord('post', 1, { include: 'comments' });
    });

    let assertError = function(e) {
      let regexp = /You tried to render a .+ that accesses relationships off of a post, but that model didn't have all of its required relationships preloaded ('comments.author')*/;
      assert.ok(e.message.match(regexp));
    };

    if (this.major === "2" && (this.minor === "12" || this.minor === "16")) {
      Ember.Logger.error = function() {};
      Ember.Test.adapter.exception = assertError;
    } else {
      Ember.onerror = assertError;
    }

    await render(hbs`
      {{assert-must-preload post "comments.author"}}
    `);
  });

  test('it does not error if the relationship was loaded', async function(assert) {
    this.server.create('post');
    this.post = await run(() => {
      return this.store.loadRecord('post', 1, { include: 'comments' });
    });

    await render(hbs`
      {{assert-must-preload post "comments"}}
    `);

    // if anything renders, we're ok
    assert.dom('*').hasText('');
  });

  test('it should work with calls to loadRecords', async function(assert) {
    let post = this.server.create('post', { title: 'Post title' });
    this.server.createList('comment', 3, { post });

    let posts = await run(() => {
      return this.store.loadRecords('post', { include: 'comments' });
    });

    this.post = posts.firstObject;

    await render(hbs`
      {{assert-must-preload post "comments"}}

      <div data-test-id="title">
        {{post.title}}
      </div>
    `);

    assert.dom('[data-test-id="title"]').hasText("Post title");
  });

  test('it should work with dot paths given to loadRecords', async function(assert) {
    let post = this.server.create('post', { title: 'Post title' });
    let comments = this.server.createList('comment', 3, { post });

    comments.forEach(comment => {
      server.create('author', { comments: [comment] });
    });

    let posts = await run(() => {
      return this.store.loadRecords('post', { include: 'comments.author' });
    });

    this.post = posts.firstObject;

    await render(hbs`
      {{assert-must-preload post "comments.author"}}
    `);

    assert.dom('*').hasText('');
  });

  test('it should work with multiple relationships given to loadRecords', async function(assert) {
    let author = this.server.create('author');
    let post = this.server.create('post', {
      title: 'Post title',
      author
    });
    let comments = this.server.createList('comment', 3, { post });

    comments.forEach(comment => {
      server.create('author', { comments: [comment] });
    });

    let posts = await run(() => {
      return this.store.loadRecords('post', { include: 'comments.author,author' });
    });

    this.post = posts.firstObject;

    await render(hbs`
      {{assert-must-preload post "author,comments.author"}}
    `);

    assert.dom('*').hasText('');
  });

  test('it should error if loadRecords is missing a relationship', async function(assert) {
    let author = this.server.create('author');
    let post = this.server.create('post', {
      title: 'Post title',
      author
    });
    let comments = this.server.createList('comment', 3, { post });

    comments.forEach(comment => {
      server.create('author', { comments: [comment] });
    });

    let posts = await run(() => {
      return this.store.loadRecords('post', { include: 'comments,author' });
    });

    this.post = posts.firstObject;

    let assertError = function(e) {
      let regexp = /You tried to render a .+ that accesses relationships off of a post, but that model didn't have all of its required relationships preloaded ('comments.author')*/;
      assert.ok(e.message.match(regexp));
    };

    if (this.major === "2" && (this.minor === "12" || this.minor === "16")) {
      Ember.Logger.error = function() {};
      Ember.Test.adapter.exception = assertError;
    } else {
      Ember.onerror = assertError;
    }

    await render(hbs`
      {{assert-must-preload post "author,comments.author"}}
    `);
  });
});
