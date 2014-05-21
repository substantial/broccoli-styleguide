var util       = require('util');
var path       = require('path');

var PageFilter = require('../filter');

function HTMLFilter(inputTree, options) {
  if (!(this instanceof HTMLFilter)) return new HTMLFilter(inputTree, options);
  PageFilter.call(this, inputTree, options);
}
util.inherits(HTMLFilter, PageFilter);
HTMLFilter.prototype.extensions = ['htm', 'html'];
HTMLFilter.prototype.targetExtension = 'html';
HTMLFilter.prototype.processPage = function(source, page) {
  return source;
};

module.exports = HTMLFilter;