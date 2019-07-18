
if (typeof FastBoot === 'undefined') {
  if (typeof runningTests === 'undefined' || !runningTests) {
    require('dummy/app')['default'].create({});
  }
}

define('~fastboot/app-factory', ['dummy/app', 'dummy/config/environment'], function(App, config) {
  App = App['default'];
  config = config['default'];

  return {
    'default': function() {
      return App.create(config.APP);
    }
  };
});
