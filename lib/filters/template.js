var inherits = require('util').inherits;
var basename = require('path').basename;
var extname  = require('path').extname;

var Filter = require('broccoli-filter');
var utils  = require('../utils');

var TemplateFilter = function(inputTree, options) {
  if (!(this instanceof TemplateFilter)) return new TemplateFilter(inputTree, options);
  Filter.call(this, inputTree, options);

  this.pages = options.pages;
};
inherits(TemplateFilter, Filter);
TemplateFilter.prototype.extensions = ['htm', 'html'];
TemplateFilter.prototype.targetExtension = 'html';
TemplateFilter.prototype.processString = function(string, relativePath) {
  var pages = this.pages;
  var relativePath = utils.relativePath(relativePath);
  var page;
  if (this.pages && this.pages.root) {
    page = this.pages.root.getPage(relativePath);
  }
  if (page.template) {
    var templateName = basename(page.template, extname(page.template));
    if (pages && pages.templates && pages.templates.hasOwnProperty(templateName)) {
      var template = pages.templates[templateName];
      var options = {
        data: {
          globals: pages.globals
        },
        helpers: {
          html: function() {
            return new pages.Handlebars.SafeString(page.toString());
          }
        }
      };
      string = template(page, options);
    }
  }
  return string;
};

module.exports = TemplateFilter;