import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { run } from '@ember/runloop';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';
import LoadableModel from 'ember-data-storefront/mixins/loadable-model';
import LoadableStore from 'ember-data-storefront/mixins/loadable-store';
import Ember from 'ember';
import Model from '@ember-data/model';

module('Integration | Component | assert must preload', function (hooks) {
  setupRenderingTest(hooks);

  // keep an eye on this issue:
  // https://github.com/emberjs/ember-test-helpers/issues/310
  let onerror;
  let adapterException;
  let loggerError;

  hooks.beforeEach(function () {
    Model.reopen(LoadableModel);
    this.store = this.owner.lookup('service:store');
    this.store.reopen(LoadableStore);
    this.store.resetCache();
    this.server = startMirage();
    onerror = Ember.onerror;
    adapterException = Ember.Test.adapter.exception;
    loggerError = Ember.Logger.error;

    // the next line doesn't work in 2.x due to an eslint rule
    // eslint-disable-next-line
    [ this.major, this.minor ] = Ember.VERSION.split(".");

    // setup a bunch of data that our tests will load
    let author = this.server.create('author');
    let post = this.server.create('post', {
      id: 1,
      title: 'Post title',
      author,
    });
    let comments = this.server.createList('comment', 3, { post });

    comments.forEach((comment) => {
      server.create('author', { comments: [comment] });
    });
  });

  hooks.afterEach(function () {
    Ember.onerror = onerror;
    Ember.Test.adapter.exception = adapterException;
    Ember.Logger.error = loggerError;
    this.server.shutdown();
  });

  test('it errors if the relationship has not yet be loaded', async function (assert) {
    this.post = await run(() => {
      return this.store.loadRecord('post', 1);
    });

    let assertError = function (e) {
      let regexp =
        /You tried to render a .+ that accesses relationships off of a post, but that model didn't have all of its required relationships preloaded ('comments')*/;
      assert.ok(e.message.match(regexp));
    };

    if (this.major === '2' && (this.minor === '12' || this.minor === '16')) {
      Ember.Logger.error = function () {};
      Ember.Test.adapter.exception = assertError;
    } else {
      Ember.onerror = assertError;
    }

    await render(hbs`
      <AssertMustPreload @model={{this.post}} @includes={{array "comments"}} />
    `);
  });

  test('it errors if one of the relationships has not yet be loaded', async function (assert) {
    this.post = await run(() => {
      return this.store.loadRecord('post', 1, { include: 'author' });
    });

    let assertError = function (e) {
      let regexp =
        /You tried to render a .+ that accesses relationships off of a post, but that model didn't have all of its required relationships preloaded ('comments')*/;
      assert.ok(e.message.match(regexp));
    };

    if (this.major === '2' && (this.minor === '12' || this.minor === '16')) {
      Ember.Logger.error = function () {};
      Ember.Test.adapter.exception = assertError;
    } else {
      Ember.onerror = assertError;
    }

    await render(hbs`
      <AssertMustPreload @model={{this.post}} @includes={{array "author,comments"}} />
    `);
  });

  test('it errors if a nested relationship has not yet be loaded', async function (assert) {
    this.post = await run(() => {
      return this.store.loadRecord('post', 1, { include: 'comments' });
    });

    let assertError = function (e) {
      let regexp =
        /You tried to render a .+ that accesses relationships off of a post, but that model didn't have all of its required relationships preloaded ('comments.author')*/;
      assert.ok(e.message.match(regexp));
    };

    if (this.major === '2' && (this.minor === '12' || this.minor === '16')) {
      Ember.Logger.error = function () {};
      Ember.Test.adapter.exception = assertError;
    } else {
      Ember.onerror = assertError;
    }

    await render(hbs`
      <AssertMustPreload @model={{this.post}} @includes={{array "comments.author"}} />
    `);
  });

  test('it does not error if the relationship was loaded', async function (assert) {
    this.post = await run(() => {
      return this.store.loadRecord('post', 1, { include: 'comments' });
    });

    await render(hbs`
      <AssertMustPreload @model={{this.post}} @includes={{array "comments"}} />
    `);

    // if anything renders, we're ok
    assert.dom('*').hasText('');
  });

  module('Data loaded with loadRecords', function () {
    test('it should not error when all data is loaded', async function (assert) {
      let posts = await run(() => {
        return this.store.loadRecords('post', { include: 'comments' });
      });

      this.post = posts.get('firstObject');

      await render(hbs`
        <AssertMustPreload @model={{this.post}} @includes={{array "comments"}} />

        <div data-test-id="title">
          {{this.post.title}}
        </div>
      `);

      assert.dom('[data-test-id="title"]').hasText('Post title');
    });

    test('it should error is not all data is loaded', async function (assert) {
      let posts = await run(() => {
        return this.store.loadRecords('post', { include: 'comments,author' });
      });

      this.post = posts.get('firstObject');

      let assertError = function (e) {
        let regexp =
          /You tried to render a .+ that accesses relationships off of a post, but that model didn't have all of its required relationships preloaded ('comments.author')*/;
        assert.ok(e.message.match(regexp));
      };

      if (this.major === '2' && (this.minor === '12' || this.minor === '16')) {
        Ember.Logger.error = function () {};
        Ember.Test.adapter.exception = assertError;
      } else {
        Ember.onerror = assertError;
      }

      await render(hbs`
        <AssertMustPreload @model={{this.post}} @includes={{array "author,comments.author"}} />
      `);
    });
  });
});
