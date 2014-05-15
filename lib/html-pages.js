var Filter = require('broccoli-filter'),
    RSVP = require('rsvp'),
    _ = require('lodash-node'),
    op = require('./operations'),
    defaults = require('./defaults');

HTMLPages.prototype = Object.create(Filter.prototype);
HTMLPages.prototype.constructor = HTMLPages;

function HTMLPages (inputTree, options) {
  if (!(this instanceof HTMLPages)) return new HTMLPages(inputTree, options);
  Filter.call(this, inputTree, options);
  this.options = _.merge(defaults, options);
}

HTMLPages.prototype.extensions = ['htm', 'html'];
HTMLPages.prototype.targetExtension = 'html';

HTMLPages.prototype.processString = function(string) {

  var options = this.options;

  return op.splitDocument(string)
    .then(function(parts){
      var document = {
        metadata: '',
        html: string
      };
      if (parts && _.isArray(parts)) {
        document.metadata = parts[1];
        document.html = parts[2];
      }
      return document;
    })
    .then(function(document){
      return RSVP.hash({
        metadata: op.parseMetadata(document.metadata),
        html: document.html
      })
    })
    .then(op.optionalTemplate(options), console.log);

};

module.exports = HTMLPages;