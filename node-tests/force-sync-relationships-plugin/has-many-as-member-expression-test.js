/* eslint-env node */
var babel = require('babel-core');
var stripIndent = require('strip-indent');
var ForceSynceRelationshipsPlugin = require('../../force-sync-relationships-plugin');
var module = QUnit.module;
var test = QUnit.test;

function testOriginalToTransformed(description, original, transformed) {
  return test(description, function(assert) {
    let strippedOriginal = stripIndent(original);
    let strippedTransformed = stripIndent(transformed);
    var result = babel.transform(strippedOriginal, {
      plugins: [ ForceSynceRelationshipsPlugin ],
    });

    assert.equal(result.code.trim(), strippedTransformed.trim());
  });
}

module('DS.hasMany as Member Expression', function() {

  testOriginalToTransformed('it works when called with no arguments',
    `
      export default Model.extend({

        posts: DS.hasMany()

      });
    `,
    `
      export default Model.extend({

        posts: DS.hasMany({
          async: false
        })

      });
  `);

  testOriginalToTransformed('it works when called with a model name',
    `
      export default Model.extend({

        posts: DS.hasMany('post')

      });
    `,
    `
      export default Model.extend({

        posts: DS.hasMany('post', {
          async: false
        })

      });
    `
  );

  testOriginalToTransformed('it merges with options other than async',
    `
      export default Model.extend({

        posts: DS.hasMany({ inverse: 'foo' })

      });
    `,
    `
      export default Model.extend({

        posts: DS.hasMany({ inverse: 'foo', async: false
        })

      });
    `
  );

  test('it throws when it sees async: true', function(assert) {
    let strippedOriginal = stripIndent(`
      export default Model.extend({

        posts: DS.hasMany({ async: true })

      });
    `);

    assert.throws(() => {
      babel.transform(strippedOriginal, {
        plugins: [ ForceSynceRelationshipsPlugin ],
      });
    });
  });

  test('it throws when it sees async: false', function(assert) {
    let strippedOriginal = stripIndent(`
      export default Model.extend({

        posts: DS.hasMany({ async: false })

      });
    `);

    assert.throws(() => {
      babel.transform(strippedOriginal, {
        plugins: [ ForceSynceRelationshipsPlugin ],
      });
    });
  });

});
