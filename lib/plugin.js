var CachingWriter = require('broccoli-caching-writer');

var normalize = require('./normalize');
var toPage    = require('./page').toPage;

function PagesPlugin(inputTree, options) {
  if (!(this instanceof PagesPlugin)) return new PagesPlugin(inputTree, options);

  this.inputTree = inputTree;

  options = options || {};

  for (var key in options) {
    if (options.hasOwnProperty(key)) {
      this[key] = options[key]
    }
  }

  this.options = options;
}
PagesPlugin.prototype = Object.create(CachingWriter.prototype);
PagesPlugin.prototype.constructor = CachingWriter;
PagesPlugin.prototype.updateCache = updateCache;
PagesPlugin.prototype.pages = null;

function updateCache(srcDir, destDir) {

  /**
   * Convert a directory of content into pages
   */
  normalize(srcDir, destDir);

  /**
   * Check that pages property is in [obj, key] format
   * If yes, the destination directory and set returned object to target[key]
   */
  if (this.pages && Array.isArray(this.pages) && this.pages.length === 2) {
    var target = this.pages[0];
    var key = this.pages[1];
    target[key] = toPage(destDir);
  }

}

module.exports = PagesPlugin;