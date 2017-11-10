import EmberObject from '@ember/object';
import LoadableMixin from 'ember-data-storefront/mixins/loadable';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('assert-must-preload', 'Integration | Component | assert must preload', {
  integration: true,

  beforeEach() {
    let LoadableObject = EmberObject.extend(LoadableMixin);
    LoadableObject.modelName = 'post';
    this.post = LoadableObject.create({
      id: '123',
      store: {
        findRecord() {}
      }
    });
  }
});

test('it errors if the relationship has not yet be loaded', function(assert) {
  assert.expectAssertion(() => {
    this.render(hbs`
      {{assert-must-preload post "comments"}}
    `)
  }, /You passed a post model into a 'component', but that model didn't have all of its required relationships preloaded ('comments')*/);
});

test('it errors if one of the relationships has not yet been loaded', function(assert) {
  this.post.load('comments');

  assert.expectAssertion(() => {
    this.render(hbs`
      {{assert-must-preload post "author,comments"}}
    `)
  });
});

test('it errors if a relationship has been loaded, but one of its relationships has not', function(assert) {
  this.post.load('comments');

  assert.expectAssertion(() => {
    this.render(hbs`
      {{assert-must-preload post "comments,author"}}
    `)
  });
});

test('it does not error if all of the relationships have been loaded', function(assert) {
  this.post.load('comments');

  this.render(hbs`
    {{assert-must-preload post "comments"}}
  `);

  // basically nothing render ok
  assert.equal(this.$().text().trim(), "");
});
