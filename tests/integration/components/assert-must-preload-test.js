import { module, test, setupRenderingTest } from 'ember-qunit';
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

  hooks.beforeEach(function() {
    DS.Model.reopen(LoadableModel);
    this.store = this.owner.lookup('service:store')
    this.store.reopen(LoadableStore);
    this.store.resetCache();
    this.server = startMirage();
    onerror = Ember.onerror;
  });

  hooks.afterEach(function() {
    this.server.shutdown();
    Ember.onerror = onerror;
  });

  test('it errors if the relationship has not yet be loaded', async function(assert) {
    this.server.create('post');
    this.post = await run(() => {
      return this.store.loadRecord('post', 1);
    });

    Ember.onerror = function(e) {
      let regexp = /You tried to render a .+ that accesses relationships off of a post, but that model didn't have all of its required relationships preloaded ('comments')*/;
      assert.ok(e.message.match(regexp));
    };

    this.render(hbs`
      {{assert-must-preload post "comments"}}
    `);
  });

  test('it errors if one of the relationships has not yet be loaded', async function(assert) {
    this.server.create('post');
    this.post = await run(() => {
      return this.store.loadRecord('post', 1, { include: 'author' });
    });

    Ember.onerror = function(e) {
      let regexp = /You tried to render a .+ that accesses relationships off of a post, but that model didn't have all of its required relationships preloaded ('comments')*/;
      assert.ok(e.message.match(regexp));
    };

    this.render(hbs`
      {{assert-must-preload post "author,comments"}}
    `);
  });

  test('it errors if a nested relationship has not yet be loaded', async function(assert) {
    this.server.create('post');
    this.post = await run(() => {
      return this.store.loadRecord('post', 1, { include: 'comments' });
    });

    Ember.onerror = function(e) {
      let regexp = /You tried to render a .+ that accesses relationships off of a post, but that model didn't have all of its required relationships preloaded ('comments.author')*/;
      assert.ok(e.message.match(regexp));
    };

    this.render(hbs`
      {{assert-must-preload post "comments.author"}}
    `);
  });

  test('it does not error if the relationship was loaded', async function(assert) {
    this.server.create('post');
    this.post = await run(() => {
      return this.store.loadRecord('post', 1, { include: 'comments' });
    });

    this.render(hbs`
      {{assert-must-preload post "comments"}}
    `);

    // if nothing renders, we're ok
    assert.equal(this.$().text().trim(), "");
  });

});
