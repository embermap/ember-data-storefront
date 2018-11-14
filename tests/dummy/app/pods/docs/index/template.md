# Overview

Welcome to Storefront. Your life with Ember Data is about to get a whole lot better!

## Installation

To install Storefront, run

```sh
ember install ember-data-storefront
```

Once installed you'll be able to use the mixins in your app. See the LoadableModel and LoadableStore pages in the docs. 

## Benefits

### Better data fetching

Ever gotten bit by `store.findAll` resolving synchronously with the 1 record that happens to be loaded? Do you keep using `reload: true` as an escape hatch? Are you coding around whether a record has been "fully loaded" for a detail page?

Storefront's Query API has your back.

{{docs-link 'Learn more' 'docs.guides.data-fetching'}}.

### Predictable relationships

Async relationships got you down? Check out our `Loadable` mixin and keep all your data-fetching logic explicit.

{{docs-link 'Learn more' 'docs.guides.working-with-relationships'}}.

### Fewer rendering bugs

Do certain paths through your application lead to templates being rendered with missing data? Tired of hitting the `n + 1` query bug? By declaring your routes' and templates' data needs, your app will become more robust.

{{docs-link 'Learn more' 'docs.guides.avoiding-errors'}}.
