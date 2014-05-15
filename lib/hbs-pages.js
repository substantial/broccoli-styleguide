var Filter = require('broccoli-filter'),
    RSVP = require('rsvp'),
    _ = require('lodash-node'),
    op = require('./operations'),
    defaults = require('./defaults'),
    Handlebars = require('handlebars');

HBSPages.prototype = Object.create(Filter.prototype);
HBSPages.prototype.constructor = HBSPages;

function HBSPages (inputTree, options) {
  if (!(this instanceof HBSPages)) return new HBSPages(inputTree, options);
  Filter.call(this, inputTree, options);
  this.options = _.merge(defaults, options);
}

HBSPages.prototype.extensions = ['hbs', 'handlebars'];
HBSPages.prototype.targetExtension = 'html';

HBSPages.prototype.processString = function(string) {

  var options = this.options;

  // alias option for options.templates, since it's a bit clearer (could change this everywhere,
  // but would be a breaking change)
  if ( options.layouts ) {
    options.templates = options.layouts;
  }

  op.registerHelpersAndPartials(options);


  var document = {
    metadata: '',
    hbs: string
  };

  return op.splitDocument(string)
    .then(function(parts){
      if (parts && _.isArray(parts)) {
        document.metadata = parts[1];
        document.hbs = parts[2];
      }
      return document;
    })
    .then(function(document){
      document.template = Handlebars.compile(document.hbs.toString());
      return document;
    })
    .then(op.renderTemplate(options))
    .then(function(template) {
      return RSVP.hash({
        metadata: op.parseMetadata(document.metadata),
        html: template
      });
    })
    .then(op.optionalTemplate(options), console.log);

};

module.exports = HBSPages;
