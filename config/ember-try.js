"use strict";

const getChannelURL = require("ember-source-channel-url");

module.exports = function() {
  return Promise.all([
    getChannelURL("release"),
    getChannelURL("beta"),
    getChannelURL("canary")
  ]).then(urls => {
    return {
      useYarn: true,
      scenarios: [
        {
          name: "ember-lts-3.12",
          npm: {
            devDependencies: {
              "ember-source": "~3.12.0",
              "ember-data": "~3.12.0"
            },
            resolutions: {
              "ember-data": "~3.12.0"
            }
          }
        },
        {
          name: "ember-lts-3.16",
          npm: {
            devDependencies: {
              "ember-source": "~3.16.0",
              "ember-data": "~3.16.0"
            },
            resolutions: {
              "ember-data": "~3.16.0"
            }
          }
        },
        {
          name: "ember-release",
          npm: {
            devDependencies: {
              "ember-source": urls[0],
              "ember-data": "latest"
            }
          }
        },
        {
          name: "ember-beta",
          npm: {
            devDependencies: {
              "ember-source": urls[1],
              "ember-data": "beta"
            }
          }
        },
        {
          name: "ember-canary",
          npm: {
            devDependencies: {
              "ember-source": urls[2],
              "ember-data": "canary"
            }
          }
        },
        {
          name: "ember-default",
          npm: {
            devDependencies: {}
          }
        }
      ]
    };
  });
};
