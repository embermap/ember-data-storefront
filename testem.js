/* eslint-env node */
module.exports = {
  test_page: 'tests/index.html?hidepassed',
  disable_watching: true,
  launch_in_ci: [
    'Chrome'
  ],
  launch_in_dev: [
  ],
  browser_args: {
    Chrome: {
      mode: 'ci',
      args: [
        /*
          --no-sandbox is needed when running Chrome inside a container.

          See https://github.com/ember-cli/ember-cli-chai/pull/45/files.
        */
        process.env.TRAVIS ? '--no-sandbox' : null,

        '--disable-gpu',
        '--headless',
        '--remote-debugging-port=9222',
        '--window-size=1440,900'
      ].filter(Boolean)
    },
  }
};
