var inherits = require('util').inherits;
var basename = require('path').basename;
var extname  = require('path').extname;

var PageFilter = require('../filter');
var utils  = require('../utils');

var TemplateFilter = function(inputTree, options) {
  if (!(this instanceof TemplateFilter)) return new TemplateFilter(inputTree, options);
  PageFilter.call(this, inputTree, options);

  this.pages = options.pages;
};
inherits(TemplateFilter, PageFilter);
TemplateFilter.prototype.extensions = ['htm', 'html'];
TemplateFilter.prototype.targetExtension = 'html';
TemplateFilter.prototype.processPage = function(string, page) {
  if (page.template) {
    var templateName = basename(page.template, extname(page.template));
    var pages = this.pages;
    if (pages && pages.templates && pages.templates.hasOwnProperty(templateName)) {
      var template = pages.templates[templateName];
      var options = {
        data: {
          globals: pages.globals || {}
        },
        helpers: {
          html: function() {
            return new pages.Handlebars.SafeString(string);
          }
        }
      };
      string = template(page, options);
    }
  }
  return string;
};
module.exports = TemplateFilter;