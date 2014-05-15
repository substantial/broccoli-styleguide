var Pages = require('broccoli-pages');

var pages = new Pages({
  content: './content',
  templates: './templates',
  helpers: './helpers',
  partials: './templates/partials',
  globals: {
    message: "Hello World",
    team: ['Bob', 'Joe', 'Mary']
  }
});

module.exports = pages.toTree();
