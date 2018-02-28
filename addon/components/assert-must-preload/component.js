import { assert } from '@ember/debug';
import Component from '@ember/component';

/**
  _This component relies on JSON:API, and assumes that your server supports JSON:API includes._

  _{{assert-must-preload}} only works on models that have included the Loadable mixin._

  Use this when authoring a component that requires a model to be passed in with
  certain relationships already loaded.

  For example, if you wanted to ensure the following template was never rendered without `post.comments` already loaded, you could add the call to `{{assert-must-preload}}`:

  ```hbs
  {{assert-must-preload post 'comments.author'}}

  {{!-- the rest of your template --}}
  {{#each post.comments as |comment|}}
    This comment was written by {{comment.author.name}}
  {{/each}}
  ```

  If any developer ever tries to render this template without first loading the post's `comments.author`, they'll get a dev-time error.

  @class AssertMustPreload
  @public
*/
export default Component.extend({
  tagName: '',

  didReceiveAttrs() {
    let [ model, ...includes ] = this.get('args');
    let parentComponent = this.parentView;
    let parentName = parentComponent ? parentComponent._debugContainerKey : 'template';
    let includesString = includes.join(',');

    assert(
      `You passed a ${model.constructor.modelName} model into an {{assert-must-preload}}, but that model is not using the Loadable mixin. [ember-data-storefront]`,
      model.hasLoaded
    );

    assert(
      `You tried to render a ${parentName} that accesses relationships off of a ${model.constructor.modelName}, but that model didn't have all of its required relationships preloaded ('${includesString}'). Please make sure to preload the association. [ember-data-storefront]`,
      model.hasLoaded(includesString)
    );

    return this._super(...arguments);
  }

}).reopenClass({

  positionalParams: 'args'

});
