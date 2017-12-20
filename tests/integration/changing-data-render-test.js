import { moduleForComponent, test } from 'ember-qunit';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';
import { Model, JSONAPISerializer } from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';
import { run } from '@ember/runloop';

moduleForComponent('Integration | Changing data render test', {
  integration: true,

  beforeEach() {
    this.server = new Server({
      environment: 'test',
      models: {
        post: Model.extend()
      },
      serializers: {
        application: JSONAPISerializer
      },
      baseConfig() {
        this.resource('posts');
      }
    });
    this.storefront = this.container.lookup('service:storefront')
  }
});

test('the template rerenders for fresh storefront queries', function(assert) {
  let serverPost = this.server.create('post', { title: 'Lorem' });
  let postId = serverPost.id;

  run(() => {
    return this.storefront.loadRecord('post', postId)
      .then(post => {
        this.set('model', post);
      });
  });

  this.render(hbs`
    {{model.title}}
  `);

  wait().then(() => {
    assert.equal(this.$().text().trim(), "Lorem");
  });

  wait().then(() => {
    this.server.schema.posts.find(serverPost.id).update('title', 'ipsum');
    run(() => {
      return this.storefront.loadRecord('post', postId);
    });
  });

  return wait().then(() => {
    assert.equal(this.$().text().trim(), "ipsum");
  });
});
