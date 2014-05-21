var CachingWriter = require('broccoli-caching-writer');
var path          = require('path');
var fs            = require('fs-extra');

var Page          = require('./page');
var relativePath  = require('./utils').relativePath;

function PagesPlugin(inputTree, options) {
  if (!(this instanceof PagesPlugin)) return new PagesPlugin(inputTree, options);
  this.inputTree = inputTree;

  for (var key in options) {
    if (options.hasOwnProperty(key)) {
      this[key] = options[key]
    }
  }

  this.options = options;
}
PagesPlugin.prototype = Object.create(CachingWriter.prototype);
PagesPlugin.prototype.constructor = CachingWriter;
PagesPlugin.prototype.pages = null;
PagesPlugin.prototype.updateCache = function(srcDir, destDir) {

  /**
   * Convert a directory of content into directory of pages
   */
  PagesPlugin.normalize(srcDir, destDir, null);

  /**
   *
   */
  if (this.pages) {
    this.pages.root = Page.toPage(destDir);
  }

};

/**
 * Recursive function that takes a directory of mixed content like .md, .html & handlebars
 * and gives a new directory of .page files
 * @param srcDir
 * @param destDir
 * @param base
 * @returns Page
 */
PagesPlugin.normalize = function(srcDir, destDir, base) {

  if (base == null) {
    base = srcDir;
  }

  var entries = fs.readdirSync(srcDir);
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    var fullPath = path.join(srcDir, entry);
    var relative = path.relative(base, path.dirname(fullPath));
    var basename = path.basename(entry, path.extname(entry));

    var stats = fs.lstatSync(fullPath);
    if (stats.isFile()) {
      try {
        var page = Page.fromFile(fullPath, relativePath(fullPath, base), false);
        if (page) {
          fs.outputJSONSync(path.join(destDir, relative, basename + '.page'), page);
        } else {
          fs.copySync(fullPath, path.join(destDir, relative, entry));
        }
      } catch (e) {
        console.error(e);
      }
    } else if (stats.isDirectory()) {
      // update directory
      PagesPlugin.normalize(fullPath, destDir, base);
    } else {
      throw new Error('Stat\'ed ' + fullPath + ' but it is neither file, symlink, nor directory')
    }
  }
};

module.exports = PagesPlugin;
