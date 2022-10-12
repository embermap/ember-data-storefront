import Server from 'ember-cli-mirage/server';
import { JSONAPISerializer } from 'ember-cli-mirage';
import { assign } from '@ember/polyfills';

export default function (overrides) {
  let defaults = {
    environment: 'test',
    serializers: {
      application: JSONAPISerializer,
    },
  };
  let config = assign({}, defaults, overrides);

  let server = new Server(config);

  // Have to override after instantiation, because `test` env sets to 0
  server.timing = 5;

  return server;
}
