'use strict';

const getChannelURL = require('ember-source-channel-url');

module.exports = function() {
  return Promise.all([
    getChannelURL('release'),
    getChannelURL('beta'),
    getChannelURL('canary')
  ]).then((urls) => {
    return {
      useYarn: true,
      scenarios: [
        {
          name: 'ember-lts-2.8',
          bower: {
            dependencies: {
              'ember': 'components/ember#lts-2-8'
            },
            resolutions: {
              'ember': 'lts-2-8'
            }
          },
          npm: {
            devDependencies: {
              'ember-source': null,
              'ember-data': "~2.8.0"
            }
          }
        },
        {
          name: 'ember-lts-2.12',
          npm: {
            devDependencies: {
              'ember-source': '~2.12.0',
              'ember-data': "~2.12.0"
            }
          }
        },
        {
          name: 'ember-lts-2.16',
          npm: {
            devDependencies: {
              'ember-source': '~2.16.0',
              'ember-data': "~2.16.0"
            }
          }
        },
        {
          name: 'ember-lts-2.18',
          npm: {
            devDependencies: {
              'ember-source': '~2.18.0',
              'ember-data': "~2.18.0"
            }
          }
        },
        {
          name: 'ember-3.1',
          npm: {
            devDependencies: {
              'ember-source': '~3.1.0',
              'ember-data': "~3.1.0"
            }
          }
        },
        {
          name: 'ember-lts-3.4',
          npm: {
            devDependencies: {
              'ember-source': '~3.4.0',
              'ember-data': "~3.4.0"
            }
          }
        },
        {
          name: 'ember-release',
          npm: {
            devDependencies: {
              'ember-source': urls[0],
              'ember-data': 'emberjs/data#release'
            }
          }
        },
        {
          name: 'ember-beta',
          npm: {
            devDependencies: {
              'ember-source': urls[1],
              'ember-data': 'beta'
            }
          }
        },
        {
          name: 'ember-canary',
          npm: {
            devDependencies: {
              'ember-source': urls[2],
              'ember-data': 'emberjs/data'
            }
          }
        },
        {
          name: 'ember-octane',
          env: {
            EMBER_OPTIONAL_FEATURES: JSON.stringify({
              'jquery-integration': false
            })
          },
          npm: {
            devDependencies: {
              '@ember/jquery': null,
              'ember-ajax': null,
              'ember-data': 'emberjs/data',
              'ember-source': urls[2]
            }
          }
        },
        {
          name: 'ember-default',
          npm: {
            devDependencies: {}
          }
        }
      ]
    };
  });
};
