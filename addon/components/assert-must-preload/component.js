import Ember from 'ember';

/**
  _This component relies on JSON:API, and assumes that your server supports JSON:API includes._

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
export default Ember.Component.extend({
  tagName: '',

  didReceiveAttrs() {
    let [ model, ...includes ] = this.get('args');
    let parentComponent = this.parentView;
    let parentName = parentComponent ? parentComponent._debugContainerKey : 'component';
    let includesString = includes.join(',');

    Ember.assert(
      `You passed a ${model.constructor.modelName} model into a '${parentName}', but that model didn't have all of its required relationships preloaded ('${includesString}'). Please make sure to preload the association. [ember-data-storefront]`,
      model.hasLoaded(includesString)
    );

    return this._super(...arguments);
  }

}).reopenClass({

  positionalParams: 'args'

});
