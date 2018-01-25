# Avoiding rendering errors

## Ensuring data is loaded at render-time

You can use `{{assert-must-preload}}` to throw a dev-time warning if a template is rendered without all of its requisite data.

## Avoid async relationships

Async relationships that are lazily fetched at the template-render time introduce new, potentially unwanted states into your application. You don't let Ember infer and lazily load your route's model hook, so why do you let it infer and lazily load your model's relationships?

You can read more about [our thoughts on avoiding async relationships](https://embermap.com/notes/83-the-case-against-async-relationships).
