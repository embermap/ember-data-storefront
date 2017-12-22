import { moduleForComponent, test } from 'ember-qunit';
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

test('record queries trigger template rerenders', async function(assert) {
  let serverPost = this.server.create('post', { title: 'Lorem' });
  let postId = serverPost.id;

  await run(() => {
    return this.storefront.loadRecord('post', postId)
      .then(post => {
        this.set('model', post);
      });
  });

  this.render(hbs`
    {{model.title}}
  `);

  assert.equal(this.$().text().trim(), "Lorem");

  this.server.schema.posts.find(serverPost.id).update('title', 'ipsum');
  await run(() => {
    return this.storefront.loadRecord('post', postId);
  });

  assert.equal(this.$().text().trim(), "ipsum");
});

test('record array queries trigger template rerenders', async function(assert) {
  this.server.createList('post', 2);

  await run(() => {
    return this.storefront.loadAll('post')
      .then(posts => {
        this.set('model', posts);
      });
  });

  this.render(hbs`
    <ul>
      {{#each model as |post|}}
        <li>{{post.id}}</li>
      {{/each}}
    </ul>
  `);

  assert.equal(this.$('li').length, 2);

  this.server.create('post');
  await this.get('model').update();

  assert.equal(this.$('li').length, 3);
});
