# Common data issues

General information you might find helpful.

## Linking by model

A common data issue in Ember occurs when using the `{{link-to}}` helper and passing a model.

```hbs
{{link-to "View project" "projects.show" project}}
```

If a user clicks on this link, the Ember app will transition to the `projects.show` route, but that route's `model` hook will not run. This is by design - Ember treats the passed-in model as the resolved value of its `model()` hook, and skips that hook completely to avoid making any unnecessary network calls.

This behavior is a common source of bugs, primarily because developers can pass models into `{{link-to}}` that don't match what would have been returned by a route's `model()` hook. A good example of this is if a model had been loaded on an index page, and was passed into a detail page, but that detail page was coded to expect a model that had been loaded with additional relationships.

```js
// routes/projects/show.js
model() {
  return this.store.findRecord('project', { include: 'assignees' });
}
```

If the model was loaded without the expected relationships, but then it was passed into `{{link-to}}`, that page would now render in an awkward or broken state.

Our take on this problem is that _routes should be the only source of truth regarding what data is needed for routes to load_ (that is, what data should block a route from rendering), and they should declare those data needs in their `model()` hooks.

Once routes declare those needs, all transitions into that route should go through those `model()` hooks, as this will guarantee that a route's data needs have been met. To do this, we recommend always passing an `id` to `{{link-to}}`, to force Ember routes to re-run their model hooks every time:

```hbs
{{link-to "View project" "projects.show" project.id}}
```

<aside>Depending on your route's `serialize` function, you may need to pass in a different field.</aside>

Declared data needs also lend themselves to caching, so even if a `model()` hook is running for a second time, the tool responsible for the actual data-loading (e.g. Ember Data with Storefront) can respond synchronously with the cached data. (We feel that the tooling is the appropriate place to achieve caching, rather than developers thinking through all the various paths a user can take to get to a particular route.)

If you're using Storefront and it's not loading data when entering certain routes like you expect, make sure that you're passing the model's `id` in as the second argument to the helper.