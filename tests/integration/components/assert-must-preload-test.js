import { moduleForComponent, test } from 'ember-qunit';
import { run } from '@ember/runloop';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';
import hbs from 'htmlbars-inline-precompile';
import DS from 'ember-data';
import LoadableModel from 'ember-data-storefront/mixins/loadable-model';
import LoadableStore from 'ember-data-storefront/mixins/loadable-store';

moduleForComponent('assert-must-preload', 'Integration | Component | assert must preload', {

  integration: true,

  beforeEach() {
    DS.Model.reopen(LoadableModel);
    this.store = this.container.lookup('service:store')
    this.store.reopen(LoadableStore);
    this.store.resetCache();
    this.server = startMirage();
  },

  afterEach() {
    this.server.shutdown();
  }
});

test('it errors if the relationship has not yet be loaded', async function(assert) {
  this.server.create('post');
  this.post = await run(() => {
    return this.store.loadRecord('post', 1);
  });

  assert.expectAssertion(() => {
    this.render(hbs`
      {{assert-must-preload post "comments"}}
    `)
  }, /You tried to render a .+ that accesses relationships off of a post, but that model didn't have all of its required relationships preloaded ('comments')*/);
});

test('it errors if one of the relationships has not yet be loaded', async function(assert) {
  this.server.create('post');
  this.post = await run(() => {
    return this.store.loadRecord('post', 1, { include: 'author' });
  });

  assert.expectAssertion(() => {
    this.render(hbs`
      {{assert-must-preload post "author,comments"}}
    `)
  }, /You tried to render a .+ that accesses relationships off of a post, but that model didn't have all of its required relationships preloaded ('comments')*/);
});

test('it errors if a nested relationship has not yet be loaded', async function(assert) {
  this.server.create('post');
  this.post = await run(() => {
    return this.store.loadRecord('post', 1, { include: 'comments' });
  });

  assert.expectAssertion(() => {
    this.render(hbs`
      {{assert-must-preload post "comments.author"}}
    `)
  }, /You tried to render a .+ that accesses relationships off of a post, but that model didn't have all of its required relationships preloaded ('comments.author')*/);
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
