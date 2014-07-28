# Broccoli Styleguide Filter

**Generate an HTML styleguide from CSS containing Markdown documentation &
examples.**

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
```

*/
```

## Example Brocfile.js

```javascript
var pickFiles = require('broccoli-static-compiler');

var CSSPages = require('broccoli-styleguide').CSSPages;
var MarkdownPages = require('broccoli-styleguide').MarkdownPages;
var HTMLPages = require('broccoli-styleguide').HTMLPages;
var HBSPages = require('broccoli-styleguide').HBSPages;

var options = {
  templates: './styleguide/templates',
  helpers: './styleguide/helpers',
  partials: './styleguide/templates/partials',
  globals: {
  }
};

var styleguideContent = pickFiles('app/styles', {
  srcDir: '/',
  files: ['**/*.*'],
  destDir: '/public/styleguide/'
});

var styleguideHTML;

styleguideHTML = CSSPages(styleguideContent, options);
styleguideHTML = HTMLPages(styleguideHTML, options);
styleguideHTML = MarkdownPages(styleguideHTML, options);
styleguideHTML = HBSPages(styleguideHTML, options);

module.exports = styleguideHTML;
```

### with ember-cli

Replace the last `module exports…` line with:

```javascript
var mergeTrees = require('broccoli-merge-trees');
module.exports = mergeTrees([ styleguideHTML, app.toTree() ]);
```
