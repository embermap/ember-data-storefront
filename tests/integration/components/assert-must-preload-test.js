import { moduleForComponent, test } from 'ember-qunit';
import { run } from '@ember/runloop';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';
import hbs from 'htmlbars-inline-precompile';
import DS from 'ember-data';
import Loadable from 'ember-data-storefront/mixins/loadable';

moduleForComponent('assert-must-preload', 'Integration | Component | assert must preload', {

  integration: true,

  beforeEach() {
    DS.Model.reopen(Loadable);
    this.storefront = this.container.lookup('service:storefront')
    this.server = startMirage();
  },

  afterEach() {
    this.server.shutdown();
  }
});

test('it errors if the relationship has not yet be loaded', async function(assert) {
  this.server.create('post');
  this.post = await run(() => {
    return this.storefront.findRecord('post', 1);
  });

  assert.expectAssertion(() => {
    this.render(hbs`
      {{assert-must-preload post "comments"}}
    `)
  }, /You passed a post model into a .+, but that model didn't have all of its required relationships preloaded ('comments')*/);
});

test('it errors if one of the relationships has not yet be loaded', async function(assert) {
  this.server.create('post');
  this.post = await run(() => {
    return this.storefront.findRecord('post', 1, { include: 'author' });
  });

  assert.expectAssertion(() => {
    this.render(hbs`
      {{assert-must-preload post "author,comments"}}
    `)
  }, /You passed a post model into a .+, but that model didn't have all of its required relationships preloaded ('comments')*/);
});

test('it errors if a nested relationship has not yet be loaded', async function(assert) {
  this.server.create('post');
  this.post = await run(() => {
    return this.storefront.findRecord('post', 1, { include: 'comments' });
  });

  assert.expectAssertion(() => {
    this.render(hbs`
      {{assert-must-preload post "comments.author"}}
    `)
  }, /You passed a post model into a .+, but that model didn't have all of its required relationships preloaded ('comments.author')*/);
});

test('it does not error if the relationship was loaded', async function(assert) {
  this.server.create('post');
  this.post = await run(() => {
    return this.storefront.findRecord('post', 1, { include: 'comments' });
  });

  this.render(hbs`
    {{assert-must-preload post "comments"}}
  `);

  // if nothing renders, we're ok
  assert.equal(this.$().text().trim(), "");
});
