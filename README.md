# Broccoli Styleguide Filter

**Generate an HTML styleguide from CSS containing Markdown documentation &
examples.**

:construction: *This project was a spike; it is not complete or maintained. To be useful, the styleguide should be to be able to load the Ember app's JS & CSS, but that is not possible without building the styleguide as part of the Ember app… which turns out to be an entirely different project beyond the original fork.*

Inspired by [Hologram](https://github.com/trulia/hologram) for Ruby.

Originally forked from [broccoli-pages](https://github.com/quandl/broccoli-pages).

Maintains the original broccoli-pages functionality to build a static site from
HTML, Markdown, & Handlebars templates.

Adds parsing of CSS files for documentation blocks: `/*doc … */`. The contents
of documentation blocks are parsed as a Markdown file, with the addition of
**\*_example** code blocks, like Hologram.

## Example CSS file
```
/*doc
---
title: App Identity
name: app-identity
category: atom
template: default.hbs
---

```html_example
<div class="app-identity">
  <img class="main-logo" src="/images/logo.png" alt="">
  <div class="page-title">Appify</div>
</div>
\```

*/
```

## Example Brocfile.js

```javascript
var pickFiles = require('broccoli-static-compiler');

var CSSPages = require('broccoli-styleguide').CSSPages;

var options = {
  templates: './styleguide/templates',
  helpers: './styleguide/helpers',
  partials: './styleguide/templates/partials',
  extensions: ['css', 'scss', 'less'],
  targetExtension: 'hbs',
  globals: {}
};

var styleguideContent = pickFiles('app/styles', {
  srcDir: '/',
  files: ['**/*.*'],
  destDir: '/styleguide/'
});

module.exports = CSSPages(styleguideContent, options);;
```

### with ember-cli

Replace the last `module exports…` line with:

```javascript
var mergeTrees = require('broccoli-merge-trees');
module.exports = mergeTrees([ styleguideHTML, app.toTree() ]);
```
