import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import Model from '@ember-data/model';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';

module('Integration | Component | Load records example', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('model:user', class extends Model {});
    this.owner.register(
      'component:load-records',
      class extends Component {
        @service store;
        constructor() {
          super(...arguments);

          const { modelName, params } = this.args;
          this.store.loadRecords(modelName, { ...params });
        }
      }
    );
    this.server = startMirage();
  });

  hooks.afterEach(function () {
    this.server.shutdown();
  });

  // This ensures users can write a <LoadRecords /> component. See https://github.com/embermap/ember-data-storefront/issues/79.
  test('users should be able to invoke #loadRecords using a hash from a template', async function (assert) {
    this.server.get('/users', () => ({ data: [] }));

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
