# Client Side Javascript

We aim to follow the GOVUK advice on progressive enhancement wherever possible:
https://www.gov.uk/service-manual/technology/using-progressive-enhancement

When we do add client side javascript, we add any reusable or non-page specific
js in our `shared` folder, and import it in `shared/index.js`.  This will get bundled
all together and minified by esbuild. All pages will load and run this shared
javascript. Any page specific javascript files outside the `shared` folder are kept
separate and will only be loaded and run if declared in `<script>` elements in the
page template.  The cache busting process adds a hash to the js file so remember when
referencing a js file to use the `assetMap` nunjucks filter, e.g.

```html
<script src={{ "/assets/js/my.js" | assetMap }}></script>
```
