# Good to know

General information you might find helpful.

## Linking to dynamic segments

If Storefront is not loading data when entering routes with dynamic segments
(like `/users/:id`) and you are using the `{{link-to}}` helper, make sure that
you are passing the model's id as the second helper argument (as passing the
model context itself will not trigger the model hook responsible for fetching
the data).

```handlebars
{{! will not run model hook }}
{{link-to "View project" "projects.show" project}}

{{! will run model hook }}
{{link-to "View project" "projects.show" project.id}}
```
