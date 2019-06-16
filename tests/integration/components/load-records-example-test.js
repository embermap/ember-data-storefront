import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import Component from '@ember/component';
import hbs from 'htmlbars-inline-precompile';
import { inject as service } from '@ember/service';
import { render } from '@ember/test-helpers';
import Model from 'ember-data/model';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';

module('Integration | Component | Load records example', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.owner.register('model:user', Model.extend());
    this.owner.register('component:load-records', Component.extend({
      store: service(),
      didInsertElement() {
        this._super(...arguments);

        this.store.loadRecords(this.modelName, { ...this.params });
      }
    }));
    this.server = startMirage();
  });

  // This ensures users can write a <LoadRecords /> component. See https://github.com/embermap/ember-data-storefront/issues/79.
  test('users should be able to invoke #loadRecords using a hash from a template', async function(assert) {
    this.server.get('/users', () => ({ data: []}));

    await render(hbs`
      <LoadRecords
        @modelName='user'
        @params={{hash
          sort='-position'
          page=(hash limit=4)
        }}
      />
    `);

    assert.ok(true);
  });
});
