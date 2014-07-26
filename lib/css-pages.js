var Filter = require('broccoli-filter'),
    RSVP = require('rsvp'),
    marked = require('marked'),
    parseMarkdown = RSVP.denodeify(marked),
    _ = require('lodash'),
    defaults = require('./defaults'),
    op = require('./operations');

CSSPages.prototype = Object.create(Filter.prototype);
CSSPages.prototype.constructor = CSSPages;

function CSSPages (inputTree, options) {
  if (!(this instanceof CSSPages)) return new CSSPages(inputTree, options);
  Filter.call(this, inputTree, options);

  this.options = _.merge(defaults, options);
  marked.setOptions(options.markdown);
}

CSSPages.prototype.extensions = ['css', 'scss', 'less'];
CSSPages.prototype.targetExtension = 'html';

CSSPages.prototype.processString = function(string) {

  var options = this.options;

  return op.extractDocFromCSS(string)
    .then(function(cssDoc) {
      return op.splitDocument(cssDoc); // into { metadata: string, markdown: string }
    })
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

// Override code renderer to add Example generation.
marked.Renderer.prototype.code = function(code, lang, escaped) {
  var renderedCode;

  if (this.options.highlight) {
    var out = this.options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  if (!lang) {
    // language-less code
    renderedCode = '<pre><code>'
      + (escaped ? code : escape(code, true))
      + '\n</code></pre>';
  } else if (lang.indexOf('example') >= 0) {
    // example code: show demo then the code itself
    if (lang.indexOf('js') >= 0) {
      // javascript code gets set in a script block so that it will run
      renderedCode = '<script>' + code + '</script>\n'
        + '<div class="codeBlock jsExample"><div class="highlight"><pre>'
          + escape(code, true)
        + '</pre></div></div>\n';
    } else {
      // other code gets inserted as-is, e.g. HTML elements get rendered
      renderedCode = '<div class="codeExample">\n'
          + '<div class="exampleOutput">'
            + code
          + '</div>\n'
          + '<div class="codeBlock"><div class="highlight"><pre>'
            + escape(code, true)
          + '</pre></div></div>\n'
        + '</div>\n';
    }
  } else {
    // non-example language code
    renderedCode = '<pre><code class="'
      + this.options.langPrefix
      + escape(lang, true)
      + '">'
      + (escaped ? code : escape(code, true))
      + '\n</code></pre>\n';
  }

  return renderedCode;
};

module.exports = CSSPages;
