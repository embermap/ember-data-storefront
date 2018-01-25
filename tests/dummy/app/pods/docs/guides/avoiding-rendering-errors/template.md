# Avoiding rendering errors

These patterns minimize the states in which your templates can exist, helping you to avoid FOUC and other surprises.

## Ensure data is loaded at render-time

You can use the `{{assert-must-preload}}` component to throw a dev-time warning if a template is rendered without all of its requisite data. This can help you avoid FOUC and the `n+1` query bug.

```hbs
{{assert-must-preload post 'comments.author'}}

{{#each post.comments as |comment|}}
  This comment was from {{coment.author.name}}
{{/each}}
```

If this template is rendered with a `post` that has not loaded its `comments.author` relationship (either via `loadRecord` or the post's `#load` method), the developer will get a dev-time error.

This template assertion is especially useful for reusable components with complex data requirements.

Async relationships can also lead to surprises in templates by adding unnecessary states to your application. Read the section "Avoid async relationships" from the previous section to learn more about their pitfalls, and how to enforce sync-only relationships in your apps.
