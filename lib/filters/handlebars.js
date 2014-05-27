var util = require('util');
var PageFilter  = require('../filter');

var Handlebars = require('handlebars');

function HandlebarsFilter (inputTree, options) {
  if (!(this instanceof HandlebarsFilter)) return new HandlebarsFilter(inputTree, options);
  PageFilter.call(this, inputTree, options);
}
util.inherits(HandlebarsFilter, PageFilter);
HandlebarsFilter.prototype.extensions = ['hbs', 'handlebars'];
HandlebarsFilter.prototype.targetExtension = 'html';
HandlebarsFilter.prototype.processPage = function(source, page) {
  var template = Handlebars.compile(source);
  return template(page, {
    data: {
      globals: (this.pages) ? this.pages.globals || {} : {}
    }
  });
};

module.exports = HandlebarsFilter;
