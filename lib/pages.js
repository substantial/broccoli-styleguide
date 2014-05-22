var defaults    = require('lodash-node').defaults;
var memoize     = require('lodash-node').memoize;
var path        = require('path');
var fs          = require('fs-extra');

var Plugin        = require('./plugin');
var Filter        = require('./filter');
var Parser        = require('./parser');
var Page          = require('./page');
var filterModules = require('./filters');
var TemplateFilter = require('./filters/template');

var Handlebars  = require('handlebars');

function Pages(options) {
  if (!(this instanceof Pages)) return new Pages(options);

  options = this.options = defaults(options, {
    content: './content', // directory with content files
    templates: './templates', // template directory where Handlebars template will be loaded from,
    helpers: './helpers', // path to directory where the helpers can be found
    partials: './templates/partials', // path to directory where partials are
    // global values that will be included in context when rendering the template
    globals: {

    },
    filters: {
      html: {

      },
      markdown: {

      },
      handlebars: {

      }
    },
    parser: new Parser
  });

  this.Handlebars = Handlebars;
  this.globals = options.globals;
  this.parser = options.parser;

  fs.readdirSync(options.helpers).forEach(function(file){
    var ext = path.extname(file);
    var helperName = path.basename(file, ext);
    if (ext === '.js') {
      Handlebars.registerHelper(helperName, require(path.resolve(path.join(options.helpers, file))));
    }
  });

  fs.readdirSync(options.partials).forEach(function(file){
    var ext = path.extname(file);
    var partialName = path.basename(file, ext);
    if (ext === '.hbs' || ext === '.handlebars') {
      Handlebars.registerPartial(partialName, require(path.resolve(path.join(options.partials, file))));
    }
  });

  var templates = {};
  fs.readdirSync(options.templates).forEach(function(fileName){
    var ext = path.extname(fileName);
    var templateName = path.basename(fileName, ext);
    var file;
    var template;
    if (ext === '.hbs' || ext === '.handlebars') {
      try {
        file = fs.readFileSync(path.join(options.templates, fileName), {encoding: 'utf8'})
      } catch (e) {
        console.log('Error occurred while trying to read template', fileName);
        console.debug(e.stack);
      }
      if (file) {
        try {
          template = Handlebars.compile(file);
        } catch (e) {
          console.error('Error occurred white trying to compile', templateName);
          console.debug(e.stack);
        }
      }
      if (template) {
        templates[templateName] = template;
      }
    }
  });

  this.templates = templates;

  var filterModules = require('./filters');
  var filters = {};
  Object.keys(options.filters).forEach(function(filterName){
    var filter = filterModules[filterName];
    var opts = options.filters[filterName];
    filters[filterName] = new filter(null, defaults(opts, {
      pages: this,
      globals: options.globals
    }));
  }, this);
  this.filters = filters;

}
Pages.prototype.constructor = Pages;
/**
 * Object property that will contain in memory representation of all pages in content directory
 * @type {null|Object}
 */
Pages.prototype.root = null;
/**
 * Will contain rendered templates
 * @type {null}
 */
Pages.prototype.templates = null;
/**
 * Instance of Parser that will parse pages
 * @type {null}
 */
Pages.prototype.parser = null;
/**
 * Object hash with filter names as keys and instances of filters on values
 * @type {Object}
 */
Pages.prototype.filters = null;
/**
 * Global values that are available in all filters
 * @type {Object}
 */
Pages.prototype.globals = null;
/**
 * Handlebars library with helpers registered
 * @type {null}
 */
Pages.prototype.Handlebars = null;

Pages.prototype.toTree = memoize(function() {

  /**
   * Normalize all .html, .md and .hbs files to .pages
   * @type {PagesPlugin}
   */
  var pages = new Plugin(this.options.content, {
    pages: this,
    globals: this.globals
  });

  /**
   * Render each of the files to HTML
   * @type {PageFilter}
   */
  var content = new Filter(pages, {
    pages: this,
    globals: this.globals
  });

  /**
   * Apply template to the files
   * @type {TemplateFilter}
   */
  var templated = new TemplateFilter(content, {
    pages: this,
    globals: this.globals
  });

  return templated;
});

module.exports = Pages;