# Avoiding errors

These patterns minimize the states in which your application can exist, helping you to avoid FOUC, undefined function calls, and other surprises.

## Ensuring data is loaded within templates

<aside>
  &lbrace;&lbrace;assert-must-preload&rbrace;&rbrace; only works on models that have included the Loadable mixin.
</aside>

You can use the `{{assert-must-preload}}` component to throw a dev-time warning if a template is rendered without all of its requisite data. This can help you avoid FOUC and the `n+1` query bug.

```hbs
{{assert-must-preload post 'comments.author'}}

{{#each post.comments as |comment|}}
  This comment was from {{coment.author.name}}
{{/each}}
```

If this template is rendered with a `post` that has not loaded its `comments.author` relationship (either via `loadRecord` or the post's `#load` method), the developer will get a dev-time error.

This template assertion is especially useful for reusable components with complex data requirements.

Async relationships can also lead to surprises in actions by adding unnecessary states to your application. Read the section "Avoid async relationships" from the previous guide to learn more about their pitfalls, and how to enforce sync-only relationships in your apps.

## Ensuring data is loaded within JavaScript files

<aside>
  `#hasLoaded` only works on models that have included the Loadable mixin.
</aside>

You can use the `model#hasLoaded` method to throw a dev-time warning if a relationship is not yet loaded. This can help you avoid calling functions on undefined objects.

```js
Component.extend({
  post: null, // passed in post
  currentUser: service(),

  actions: {
    followAuthor() {
      Ember.assert(
        "The author isn't loaded",
        this.get('post').hasLoaded('author')
      );

      this.get('currentUser').follow(this.get('post.author'));
    }
  }
});
```

If the `followAuthor` action is called without the post's author being loaded the developer will see a dev-time error.
