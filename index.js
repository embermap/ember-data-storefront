'use strict';

module.exports = {
  name: 'ember-data-storefront',

  isDevelopingAddon() {
    return true;
  },

  included() {
    let app;

    // If the addon has the _findHost() method (in ember-cli >= 2.7.0), we'll just
    // use that.
    if (typeof this._findHost === 'function') {
      app = this._findHost();
    } else {
      // Otherwise, we'll use this implementation borrowed from the _findHost()
      // method in ember-cli.
      let current = this;
      do {
        app = current.app || app;
      } while (current.parent.parent && (current = current.parent));
    }

    this.app = app;
    this.addonConfig = this.app.project.config(app.env)['ember-data-storefront'] || {};

    let validOptions = [ 'rewrite', undefined ];
    if (!validOptions.includes(this.addonConfig.forceSyncRelationships)) {
      throw `[ Ember Data Storefront ] Invalid config option for forceSyncRelationships. You passed "${this.addonConfig.forceSyncRelationships}", must be one of ${validOptions.map(option => `"${option}"`).join(", ")}.`;
    }

    if (this.addonConfig.forceSyncRelationships === 'rewrite') {
      app.options = app.options || {};
      app.options.babel6 = app.options.babel6 || {};
      app.options.babel6.plugins = app.options.babel6.plugins || [];
      app.options.babel6.plugins.push(require('./force-sync-relationships-plugin'));
    }
  }

};
