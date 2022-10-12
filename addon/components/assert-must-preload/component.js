import Component from '@glimmer/component';
import { assert } from '@ember/debug';

export default class AssertMustPreloadComponent extends Component {
  /**
  _This component relies on JSON:API, and assumes that your server supports JSON:API includes._

  _<AssertMustPreload /> only works on models that have included the LoadableModel mixin._

  Use this when authoring a component that requires a model to be passed in with
  certain relationships already loaded.

  For example, if you wanted to ensure the following template was never rendered without `post.comments` already loaded, you could add the call to `<AssertMustPreload />`:

  ```hbs
  <AssertMustPreload @model={{this.post}} @includes={{array "comments.author"}} />

  {{!-- the rest of your template --}}
  {{#each this.post.comments as |comment|}}
    This comment was written by {{comment.author.name}}
  {{/each}}
  ```

  If any developer ever tries to render this template without first loading the post's `comments.author`, they'll get a dev-time error.

  @class AssertMustPreload
  @public
*/
  constructor() {
    super(...arguments);

    const { model, includes } = this.args;
    let parentComponent = this.parentView;
    let parentName = parentComponent
      ? parentComponent._debugContainerKey
      : 'template';
    let includesString = includes.join(',');

    assert(
      `You passed a ${model.constructor.modelName} model into an <AssertMustPreload />, but that model is not using the Loadable mixin. [ember-data-storefront]`,
      model.hasLoaded
    );

    assert(
      `You tried to render a ${parentName} that accesses relationships off of a ${model.constructor.modelName}, but that model didn't have all of its required relationships preloaded ('${includesString}'). Please make sure to preload the association. [ember-data-storefront]`,
      model.hasLoaded(includesString)
    );
  }
}
