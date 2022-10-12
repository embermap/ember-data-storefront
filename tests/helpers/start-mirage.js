import { startMirage } from 'dummy/initializers/ember-cli-mirage';
import scenario from 'dummy/mirage/scenarios/default';

export default function (hooks) {
  hooks.beforeEach(function () {
    this.server = startMirage();
    scenario(this.server);
  });

  hooks.afterEach(function () {
    this.server.shutdown();
  });
}
