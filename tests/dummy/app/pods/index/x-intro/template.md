# Introduction

Ember Data is powerful and flexible, but that flexibility doesn't always make it easy to do the right thing. As your app grows, it can get harder and harder to keep track of all your app's data.

Here are some common problems that show up while working on apps that use Ember Data:

- **Missing data.** It's not always clear whether all the data has been loaded for a given state of your application, especially as the number of app states compounds. Incomplete or missing data can cause problems when visiting routes, rendering components, or performing transforms on model relationships.

- **Flashing templates.** Incomplete data that Ember Data attempts to lazily load can cause your templates to unexpectedly flash during a render, making your UI disorienting.

- **Excessive network requests.** The <code>n+1</code> templating bug can cause your app to make unnecessary AJAX requests and slow down your app.

While you can solve each one of these issues on your own, Storefront's patterns help you avoid them in the first place.
