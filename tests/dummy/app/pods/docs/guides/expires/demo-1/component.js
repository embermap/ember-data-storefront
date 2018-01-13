import Component from '@ember/component';
import { computed } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { readOnly, bool, not, lt, and } from '@ember/object/computed';
import { duration } from 'ember-data-storefront/-private/utils/time';
import { A } from '@ember/array';
import moment from 'moment';

let params = { expires: '10 seconds' };

export default Component.extend({
  store: service(),
  storefront: service(),

  init() {
    this._super(...arguments);
    this.set('log', A([]));
  },

  serverPosts: computed(function() {
    return window.server.db.dump().posts;
  }),

  createServerPosts: task(function*() {
    while(true) {
      window.server.create('post');
      this.notifyPropertyChange('serverPosts');
      yield timeout(1000);
    }
  }).on('init').drop(),

  clientPosts: computed(function() {
    return this.get('store').peekAll('post');
  }),

  findAll: task(function*() {
    this.logEvent();

    let result = yield this.get('storefront')
      .findAll('post', params);

    this.get('watchLastRun').perform();

    return result;
  }),

  logEvent() {
    let hasRun = this.get('hasRun');
    let isFresh = this.get('isFresh');
    let log = this.get('log');

    if (!hasRun) {
      log.pushObject('Running for the first time!');
    } else if (isFresh) {
      log.pushObject('Not running, previous query has not expired');
    } else {
      log.pushObject('Re-running, previous query has expired');
    }
  },

  query: readOnly('findAll.lastSuccessful.value'),

  lastRun: computed('query', function() {
    let store = this.get('store');
    let storefront = this.get('storefront');

    let query = storefront
      .recordArrays
      .strategy('EmberData')
      .query(store, 'post', params)

    return query.lastRun ? new Date(query.lastRun) : null;
  }).volatile(),

  watchLastRun: task(function*() {
    while(true) {
      this.notifyPropertyChange('lastRun');
      yield timeout(100);
    }
  }).drop(),

  expiresIn: computed('lastRun', function() {
    let [ amount, unit ] = duration(params.expires);
    let lastRun = this.get('lastRun');
    return moment(lastRun)
      .add(amount, unit)
      .diff(moment());
  }),

  hasRun: bool('lastRun'),
  isExpired: lt('expiresIn', 0),
  isNotExpired: not('isExpired'),
  isStale: and('hasRun', 'lastRunExpired'),
  isFresh: and('hasRun', 'isNotExpired'),

  didInsertElement() {
    this._super(...arguments);
    this.reset();
  },

  reset() {
    this.get('store').unloadAll('post');
    this.get('storefront').resetCache();
  },

  actions: {
    toggleExpand() {
      this.toggleProperty('isExpanded');
    },

    reset() {
      this.reset();
    }
  }

});
