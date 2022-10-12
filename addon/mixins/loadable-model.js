import Mixin from '@ember/object/mixin';
import { deprecate, assert } from '@ember/debug';
import { resolve } from 'rsvp';
import { isArray } from '@ember/array';
import { get } from '@ember/object';
import { camelize } from '@ember/string';

/**
  This mixin adds new data-loading methods to your Ember Data models.

  To use it, extend a model and mix it in:

  ```js
  // app/models/post.js
  import DS from 'ember-data';
  import LoadableModel from 'ember-data-storefront/mixins/loadable-model';

  export default DS.Model.extend(LoadableModel);
  ```

  Once you understand how `LoadableModel` works We suggest adding it to every model in your app. You can do this by reopening `DS.Model` in `app.js.` and mixing it in:

  ```js
  // app/app.js
  import DS from 'ember-data';
  import LoadableModel from 'ember-data-storefront/mixins/loadable-model';

  DS.Model.reopen(LoadableModel);
  ```

  @class LoadableModel
  @public
*/
export default Mixin.create({
  init() {
    this._super(...arguments);
    this.set('_loadedReferences', {});
  },

  reloadWith(...args) {
    deprecate(
      'reloadWith has been renamed to sideload. Please change all instances of reloadWith in your app to sideload. reloadWith will be removed in 1.0',
      false,
      { id: 'ember-data-storefront.reloadWith', until: '1.0.0' }
    );

    return this.sideload(...args);
  },

  /**
    `sideload` gives you an explicit way to asynchronously sideload related data.

    ```js
    post.sideload('comments');
    ```

    The above uses Storefront's `loadRecord` method to query your backend for the post along with its comments.

    You can also use JSON:API's dot notation to load additional related relationships.

    ```js
    post.sideload('comments.author');
    ```

    Every call to `sideload()` will return a promise.

    ```js
    post.sideload('comments').then((post) => console.log('loaded comments!'));
    ```

    If a relationship has never been loaded, the promise will block until the data is loaded. However, if a relationship has already been loaded (even from calls to `loadRecord` elsewhere in your application), the promise will resolve synchronously with the data from Storefront's cache. This means you don't have to worry about overcalling `sideload()`.

    When relationship data has already been loaded, `sideload` will use a background refresh to update the relationship. To prevent sideload from making network requests for data that has already been loaded, use the `{ backgroundReload: false }` option.

    ```js
    post.sideload('comments', { backgroundReload: false });
    ```

    If you would like calls to `sideload` to always return a blocking promise, use the `{ reload: true }` option.

    ```js
    post.sideload('comments', { reload: true })
    ```

    This feature works best when used on relationships that are defined with `{ async: false }` because it allows `load()` to load the data, and `get()` to access the data that has already been loaded.

    This method relies on JSON:API and assumes that your server supports JSON:API includes.

    @method sideload
    @param {String} includesString a JSON:API includes string representing the relationships to check
    @param {Object} options (optional) a hash of options
    @return {Promise} a promise resolving with the record
    @public
  */
  sideload(...args) {
    let modelName = this.constructor.modelName;
    let possibleOptions = args[args.length - 1];
    let options;

    if (typeof possibleOptions === 'string') {
      options = {
        include: args.join(','),
      };
    } else {
      options = {
        ...possibleOptions,
        ...{ include: args.slice(0, -1).join(',') },
      };
    }

    return this.store.loadRecord(modelName, this.id, options);
  },

  /**
    `load` gives you an explicit way to asynchronously load related data.

    ```js
    post.load('comments');
    ```

    The above uses Ember data's references API to load a post's comments from your backend.

    Every call to `load()` will return a promise.

    ```js
    post.load('comments').then((comments) => console.log('loaded comments as', comments));
    ```

    If a relationship has never been loaded, the promise will block until the data is loaded. However, if a relationship has already been loaded, the promise will resolve synchronously with the data from the cache. This means you don't have to worry about overcalling `load()`.

    When relationship data has already been loaded, `load` will use a background refresh to update the relationship. To prevent load from making network requests for data that has already been loaded, use the `{ backgroundReload: false }` option.

    ```js
    post.load('comments', { backgroundReload: false });
    ```

    If you would like calls to `load` to always return a blocking promise, use the `{ reload: true }` option.

    ```js
    post.load('comments', { reload: true })
    ```

    @method load
    @param {String} name the name of the relationship to load
    @return {Promise} a promise resolving with the related data
    @public
  */
  load(name, options = { reload: false, backgroundReload: true }) {
    assert(
      `The #load method only works with a single relationship, if you need to load multiple relationships in one request please use the #sideload method [ember-data-storefront]`,
      !isArray(name) && !name.includes(',') && !name.includes('.')
    );

    let reference = this._getReference(name);
    let value = reference.value();
    let shouldBlock = !(value || this.hasLoaded(name)) || options.reload;
    let promise;

    if (shouldBlock) {
      let loadMethod = this._getLoadMethod(name, options);
      promise = reference[loadMethod].call(reference);
    } else {
      promise = resolve(value);
      if (options.backgroundReload) {
        reference.reload();
      }
    }

    return promise.then((data) => {
      // need to track that we loaded this relationship, since relying on the reference's
      // value existing is not enough
      this._loadedReferences[name] = true;
      return data;
    });
  },

  /**
    Returns

    @method _hasNamedRelationship
    @param {String} name The name of a relationship
    @return {Boolean} True if the current model has a relationship defined for the provided name
    @private
  */
  _hasNamedRelationship(name) {
    return Boolean(get(this.constructor, `relationshipsByName`).get(name));
  },

  /**
    @method _getRelationshipInfo
    @private
  */
  _getRelationshipInfo(name) {
    let relationshipInfo = get(this.constructor, `relationshipsByName`).get(
      name
    );

    assert(
      `You tried to load the relationship ${name} for a ${this.constructor.modelName}, but that relationship does not exist [ember-data-storefront]`,
      relationshipInfo
    );

    return relationshipInfo;
  },

  /**
    @method _getReference
    @private
  */
  _getReference(name) {
    let relationshipInfo = this._getRelationshipInfo(name);
    let referenceMethod = relationshipInfo.kind;
    return this[referenceMethod](name);
  },

  /**
    Given a relationship name this method will return the best way to load
    that relationship.

    @method _getLoadMethod
    @private
  */
  _getLoadMethod(name, options) {
    let relationshipInfo = this._getRelationshipInfo(name);
    let reference = this._getReference(name);
    let hasLoaded = this._hasLoadedReference(name);
    let forceReload = options.reload;
    let isAsync;

    if (relationshipInfo.kind === 'hasMany') {
      isAsync = reference.hasManyRelationship.isAsync;
    } else if (relationshipInfo.kind === 'belongsTo') {
      isAsync = reference.belongsToRelationship.isAsync;
    }

    return !forceReload && isAsync && !hasLoaded ? 'load' : 'reload';
  },

  /**
    A list of models for a given relationship. It's always normalized to a list,
    even for belongsTo, null, or unloaded relationships.

    @method _getRelationshipModels
    @private
  */
  _getRelationshipModels(name) {
    let reference = this._getReference(name);
    let info = this._getRelationshipInfo(name);
    let models;

    if (info.kind === 'hasMany') {
      models = reference.value() || [];
    } else if (info.kind === 'belongsTo') {
      models = reference.value() ? [reference.value()] : [];
    }

    return models;
  },

  /**
    This is a private method because we may refactor it in the future to have
    a difference signature. However, this method is used by other
    storefront objects. So, it's really public, but don't use it in app code!

    @method trackLoadedIncludes
    @param {String} includes A full include path. Example: "author,comments.author,tags"
    @private
  */
  trackLoadedIncludes(includes) {
    includes.split(',').forEach((path) => this._trackLoadedIncludePath(path));
  },

  /**
    Tracks a single include path as being loaded.

    We verify that the current model actually has a named relationship defined
    for the first segment of the include path, because requests for polymorphic
    collections could return mixed sets of models that don't share all of
    the relationships that were requested via includes.

    @method _trackLoadedIncludePath
    @param {String} path A single include path. Example: "comments.author"
    @private
  */
  _trackLoadedIncludePath(path) {
    let [firstInclude, ...rest] = path.split('.');
    let relationship = camelize(firstInclude);

    if (this._hasNamedRelationship(relationship)) {
      this._loadedReferences[relationship] = true;

      if (rest.length) {
        this._getRelationshipModels(relationship)
          .filter((model) => model.trackLoadedIncludes)
          .forEach((model) => model.trackLoadedIncludes(rest.join('.')));
      }
    }
  },

  /**
    This method can take an include string and see if the graph of objects
    in the store related to this model have all loaded each of the elements
    in that include string.

    @method _graphHasLoaded
    @param {String} includes A full include path. Example: "author,comments.author,tags"
    @return {Boolean} True if the includes have been loaded, false if not
    @private
  */
  _graphHasLoaded(includes) {
    return includes.split(',').every((path) => this._graphHasLoadedPath(path));
  },

  /**
    Checks wether a single include path has been loaded.

    @method _graphHasLoadedPath
    @param {String} path A single include path. Example: "comments.author"
    @return {Boolean} True if the path has been loaded, false if not
    @private
  */
  _graphHasLoadedPath(includePath) {
    let [firstInclude, ...rest] = includePath.split('.');
    let relationship = camelize(firstInclude);
    let reference = this._getReference(relationship);
    let hasLoaded = reference && this._hasLoadedReference(relationship);

    if (rest.length === 0) {
      return hasLoaded;
    } else {
      let models = this._getRelationshipModels(relationship);

      let childrenHaveLoaded = models.every((model) => {
        return (
          model.trackLoadedIncludes && model._graphHasLoaded(rest.join('.'))
        );
      });

      return hasLoaded && childrenHaveLoaded;
    }
  },

  /**
    Checks if storefront has ever loaded this reference.

    @method _hasLoadedReference
    @param {String} name Reference or relationshipname name.
    @return {Boolean} True if storefront has loaded the reference.
    @private
  */
  _hasLoadedReference(name) {
    return this._loadedReferences[name];
  },

  /**
    This method returns true if the provided includes string has been loaded and false if not.

    @method hasLoaded
    @param {String} includesString a JSON:API includes string representing the relationships to check
    @return {Boolean} true if the includes has been loaded, false if not
    @public
  */
  hasLoaded(includesString) {
    let modelName = this.constructor.modelName;
    return (
      this.store.hasLoadedIncludesForRecord(
        modelName,
        this.id,
        includesString
      ) || this._graphHasLoaded(includesString)
    );
  },
});
