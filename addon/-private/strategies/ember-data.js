export default class EmberData {
  constructor() {
  }

  shouldBlockReload(query) {
    return query.isStale() || 
      query.params.reload ||
      !query.store.adapterFor(query.type).shouldBackgroundReloadAll(query.store, query.value);
  }
}
