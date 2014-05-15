var Filter = require('broccoli-filter'),
    RSVP = require('rsvp'),
    marked = require('marked'),
    parseMarkdown = RSVP.denodeify(marked),
    _ = require('lodash-node'),
    defaults = require('./defaults'),
    op = require('./operations');

MarkdownPages.prototype = Object.create(Filter.prototype);
MarkdownPages.prototype.constructor = MarkdownPages;

function MarkdownPages (inputTree, options) {
  if (!(this instanceof MarkdownPages)) return new MarkdownPages(inputTree, options);
  Filter.call(this, inputTree, options);

  this.options = _.merge(defaults, options);
  marked.setOptions(options.markdown);
}

MarkdownPages.prototype.extensions = ['md', 'markdown'];
MarkdownPages.prototype.targetExtension = 'html';

MarkdownPages.prototype.processString = function(string) {

  var options = this.options;

  return op.splitDocument(string) // into { metadata: string, markdown: string }
    .then(function(parts){
      var document = {
        metadata: '',
        markdown: string
      };
      if (parts && _.isArray(parts)) {
        document.metadata = parts[1];
        document.markdown = parts[2];
      }
      return document;
    })
    .then(function(document){
      return RSVP.hash({
        metadata: op.parseMetadata(document.metadata),
        html: parseMarkdown(document.markdown),
        markdown: document.markdown
      })
    })
    .then(op.optionalTemplate(options), console.log);

};

module.exports = MarkdownPages;