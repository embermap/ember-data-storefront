# Avoiding rendering errors

## Ensuring data is loaded at render-time

You can use the `{{assert-must-preload}}` component to throw a dev-time warning if a template is rendered without all of its requisite data. This can help you avoid FOUC and the `n+1` query bug.

```hbs
{{assert-must-preload post 'comments.author'}}

{{#each post.comments as |comment|}}
  This comment was from {{coment.author.name}}
{{/each}}
```

If this template is rendered with a `post` that has not loaded its `comments.author` relationship (either via `loadRecord` or the post's `#load` method), the developer will get a dev-time error.

This template assertion is especially useful for reusable components with complex data requirements.

## Avoid async relationships

Async relationships that are lazily fetched at the template-render time introduce new, potentially unwanted states into your application. You don't let Ember infer and lazily load your route's model hook, so why do you let it infer and lazily load your model's relationships?

You can read more about [our thoughts on avoiding async relationships](https://embermap.com/notes/83-the-case-against-async-relationships).
