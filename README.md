# Broccoli Pages Filter

Allows you to generate HTML from Markdown, HTML and Handlebars fragments. You can specify metadata for each page.
In metadata, you can specify a Handlebars template to be used to wrap the content.

## Example Page
```markdown
---
title: Hello World
description: some text
template: default
---
**Beautiful World**
```

## Usage

```javascript
var Pages = require('broccoli-pages');

var pages = new Pages({
  templates: './templates',
  helpers: './helpers',
  partials: './templates/partials',
  globals: {
    message: "Hello World!",
    team: [ 'Bob', 'Joe', 'Mary' ]
  }
})

module.exports = pages.toTree();
```

You can see an example [Brocfile.js](example/Brocfile.js) and [example](example) directory.

