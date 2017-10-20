    import Ember from 'ember';

/*
  Use this when authoring a component that requires a model to be passed in with
  certain relationships already loaded.

  Use:

    {{assert-must-preload post 'comments.author'}}

    {{!-- the rest of your template --}}
    {{#each post.comments as |comment|}}
      This comment was written by {{comment.author.name}}
    {{/each}}
*/
const Component = Ember.Component.extend({

  didReceiveAttrs() {
    let [ model, ...includes ] = this.get('args');
    let parentComponent = this.parentView;
    let includesString = includes.join(',');

    Ember.assert(
      `You passed a ${model.constructor.modelName} model into a '${parentComponent._debugContainerKey}', but that model didn't have all of its required relationships preloaded ('${includesString}'). Please make sure to preload the association. [ember-data-loadable]`,
      model.hasLoaded(includesString)
    );

    return this._super(...arguments);
  }

});

Component.reopenClass({
  // positionalParams: [ 'model', 'includesString' ]
  positionalParams: 'args'
});

export default Component;
