var fs = require('fs'),
    path = require('path'),
    RSVP = require('rsvp'),
    yaml = require('js-yaml'),
    readFile = RSVP.denodeify(fs.readFile),
    _ = require('lodash'),
    Handlebars = require('handlebars');

function extractDocFromCSS(string) {
  return new RSVP.Promise(function(resolve, reject){
    var result;
    var startingComment = '/*doc';
    var endingComment = '*/';
    var startIndex = string.indexOf(startingComment);
    if (startIndex < 0) {
      resolve(null);
      return;
    }
    var endIndex = string.indexOf(endingComment);
    if (endIndex < 0) {
      resolve(null);
      return;
    }
    var docStartIndex = startIndex + startingComment.length + 1;
    var docEndIndex = endIndex - 1;
    result = string.substring(docStartIndex, docEndIndex);
    resolve(result);
  });
}

function splitDocument(string) {
  return new RSVP.Promise(function(resolve, reject){
    var result;
    if (string.slice(0, 3) === '---') {
      result = string.match(/^-{3,}\s([\s\S]*?)-{3,}(\s[\s\S]*|\s?)$/);
      if ((result != null ? result.length : void 0) !== 3) {
        reject('Could not parse metadata. Metadata block --- closing line could not be found.');
      }
    }
    resolve(result);
  });
}

function parseMetadata(string) {
  return new RSVP.Promise(function(resolve, reject){
    var parsed;
    try {
      parsed = yaml.load(string);
    } catch (error) {
      reject(error);
    }
    resolve(parsed);
  });
}

function registerHelpersAndPartials(options) {
  fs.readdirSync(options.helpers).forEach(function(file){
    var ext = path.extname(file),
        helperName = path.basename(file, ext);
    if (ext === '.js') {
      Handlebars.registerHelper(helperName, require(path.resolve(path.join(options.helpers, file))));
    }
  });

  fs.readdirSync(options.partials).forEach(function(file){
    var ext = path.extname(file),
      partialName = path.basename(file, ext);
    if (ext === '.hbs' || ext === '.handlebars') {
      Handlebars.registerPartial(partialName, require(path.resolve(path.join(options.partials, file))));
    }
  });
}

function optionalTemplate(options) {

  registerHelpersAndPartials(options);

  return function(document){

    var template;
    if ( document.metadata && document.metadata.template ) {
      template = document.metadata.template;
    } else if ( options.defaultLayout ) {
      template = options.defaultLayout;
    } else {
      // no layout template specified, just return the html
      return RSVP.resolve(document.html);
    }

    // render markdown as html variable of the template
    return readTemplate(options, template)
      .then(function(data){
        document.template = Handlebars.compile(data.toString());
        return document;
      })
      .then(renderTemplate(options));
  };

}

function readTemplate(options, template) {
  var templatesDirectory = options.templates;
  return readFile(path.join(templatesDirectory, template));
}

function renderTemplate(options) {

  var globals = options.globals || {};

  return function(document) {
    return new RSVP.Promise(function(resolve, reject){
      if (typeof document.template === 'function') {
        var context = _.merge(globals, document.metadata || {}, { html: document.html }), html;
        try {
          html = document.template(context);
        } catch (e) {
          reject(e);
        }
        resolve(html);
      } else {
        reject("Can not render template because document doesn't have a template.");
      }
    });
  }
}

module.exports = {
  extractDocFromCSS: extractDocFromCSS,
  splitDocument: splitDocument,
  parseMetadata: parseMetadata,
  readTemplate: readTemplate,
  renderTemplate: renderTemplate,
  optionalTemplate: optionalTemplate,
  registerHelpersAndPartials: registerHelpersAndPartials
};
