import EmberObject from '@ember/object';
import LoadableMixin from 'ember-data-storefront/mixins/loadable';
import { module, test } from 'qunit';

module('Unit | Mixin | loadable', {
  beforeEach() {
    let LoadableObject = EmberObject.extend(LoadableMixin);
    LoadableObject.modelName = 'user';
    this.subject = LoadableObject.create({
      id: '123',
      store: {
        findRecord() {}
      }
    });
  }
});

test('the mixin can be applied', function(assert) {
  assert.ok(this.subject);
});

test('by default an object should not have loaded anything', function(assert) {
  assert.equal(this.subject.get('loadedIncludes.length'), 0);
});

test('#load should reload the model', function(assert) {
  this.subject.store.findRecord = function(type, id) {
    assert.equal(type, 'user');
    assert.equal(id, '123');
  };

  this.subject.load('comments');
})

test('#load should trigger a blocking findRecord with the relationships', function(assert) {
  this.subject.store.findRecord = function(type, id, options) {
    assert.equal(options.reload, true);
  };

  this.subject.load('comments');
});

test('#load should trigger a blocking findRecord with the relationships that havent yet been loaded', function(assert) {
  this.subject.store.findRecord = function(type, id, options) {
    assert.equal(options.include, 'comments');
  };

  this.subject.load('comments');
});

test('#load should trigger a non blocking findRecord if all the relationships have already been loaded', function(assert) {
  this.subject.get('loadedIncludes').push('comments');

  this.subject.store.findRecord = function(type, id, options) {
    assert.equal(options.reload, false);
  };

  this.subject.load('comments');
});

test('#hasLoaded should return true if the relationship has been loaded', function(assert) {
  this.subject.get('loadedIncludes').push('comments');
  assert.ok(this.subject.hasLoaded('comments'));
});

test('#hasLoaded should return false if the relationship has not been loaded', function(assert) {
  assert.ok(!this.subject.hasLoaded('comments'));
});

test('#hasLoaded should return true if the relationship chain has been loaded', function(assert) {
  this.subject.get('loadedIncludes').push('comments.author');

  this.subject.store.findRecord = function(type, id, options) {
    assert.equal(options.reload, false);
  };

  this.subject.load('comments.author');
});

test('#hasLoaded should return false if the relationship is loaded, but the chain of relationships isnt', function(assert) {
  this.subject.get('loadedIncludes').push('comments');

  this.subject.store.findRecord = function(type, id, options) {
    assert.equal(options.reload, true);
  };

  this.subject.load('comments.author');
});

test('#hasLoaded should return true when two relationships have the same name, but one isnt loaded', function(assert) {
  this.subject.get('loadedIncludes').push('comments.author');

  this.subject.store.findRecord = function(type, id, options) {
    assert.equal(options.reload, true);
  };

  this.subject.load('author');
});
