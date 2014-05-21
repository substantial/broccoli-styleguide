var util        = require('util');

var PageFilter  = require('../filter');

var markdown    = require('markdown').markdown;

function MarkdownFilter(inputTree, options) {
  if (!(this instanceof MarkdownFilter)) return new MarkdownFilter(inputTree, options);
  PageFilter.call(this, inputTree, options);
}
util.inherits(MarkdownFilter, PageFilter);
MarkdownFilter.prototype.extensions = ['md', 'markdown'];
MarkdownFilter.prototype.targetExtension = 'html';
MarkdownFilter.prototype.processPage = function(source, page){
  return markdown.toHTML(source);
};
module.exports = MarkdownFilter;