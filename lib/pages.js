var defaults    = require('lodash-node/modern/objects/defaults');
var memoize    = require('lodash-node/modern/functions').memoize;

var Plugin = require('./plugin');
var Filter = require('./filter');
var toPage = require('./page').toPage;

function Pages(options) {

  this.options = defaults(options, {
    // marked options
    // @see https://github.com/chjj/marked
    markdown: {

    },
    content: './content', // directory with content files
    templates: './templates', // template directory where Handlebars template will be loaded from,
    helpers: './helpers', // path to directory where the helpers can be found
    partials: './templates/partials', // path to directory where partials are
    // global values that will be included in context when rendering the template
    globals: {

    }
  });

}

/**
 * Object property that will contain in memory representation of all pages in content directory
 * @type {null|Object}
 */
Pages.prototype.pages = null;

Pages.prototype.toTree = memoize(function() {

  var content;

  content = new Plugin(this.options.content, {
    /**
     * Plugin will use this array to know what object and its property to set in memory representation of the content
     */
    pages: [this, 'pages']
  });
  content = new Filter(content, {
    /**
     * Filter will use this array to know where to get in memory representation of the content
     */
    pages: [this, 'pages']
  });

  return content;
});

function read(dir) {
  return toPage(dir);
}

module.exports = Pages;
module.exports.read = read;