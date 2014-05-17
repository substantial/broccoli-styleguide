var CachingWriter = require('broccoli-caching-writer');
var path = require('path');
var matchHeader = require('./operations').matchHeader;
var fs = require('fs-extra');
var outputJsonSync = require('fs-extra').outputFileSync;
var yaml = require('js-yaml');
var fixturify = require('fixturify');
var traverse = require('traverse');
var toPage = require('./page').toPage;

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
PagesPlugin.prototype.updateCache = serializeDir;

PagesPlugin.prototype.pages = null;

function serializeDir(srcDir, destDir, base) {

  if (typeof base === 'undefined') {
    base = srcDir;
  }

  var entries = fs.readdirSync(srcDir);
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    var fullPath = path.join(srcDir, entry);
    var ext = path.extname(fullPath);
    var basename = path.basename(fullPath, ext);
    ext = ext.substring(1);
    var type;
    switch(ext) {
      case 'html':
        type = 'html';
        break;
      case 'md':
      case 'markdown':
        type = 'markdown';
        break;
      case 'hbs':
      case 'handlebars':
        type = 'handlebars';
        break;
      default:
        type = null;
    }

    function buildPage(string) {
      var parts = matchHeader(string);
      if (!parts) {
        return false;
      }
      var page = parseMetadata(parts[1]);
      page['body'] = parts[2].substring(1);
      page['type'] = type;
      return page;
    }

    function writePage(string) {
      var page = buildPage(string);
      if (page) {
        var relative = path.relative(base, path.dirname(fullPath));
        var dest = path.join(destDir, relative, basename + '.page');
        outputJsonSync(dest, JSON.stringify(page));
      } else {
        console.warn('Could not extract metadata from', path.relative(process.cwd(), fullPath));
      }
    }

    function parseMetadata(string) {
      var parsed = {};
      try {
        parsed = yaml.load(string);
      } catch (error) {
        console.log(error);
      }
      return parsed;
    }

    var stats = fs.lstatSync(fullPath);
    if (stats.isFile()) {
      if (type) {
        // convert file to json
        writePage(fs.readFileSync(fullPath, { encoding: 'utf8' }));
      } else {
        // copy file
        fs.copySync(fullPath, path.join(destDir, entry));
      }
    } else if (stats.isSymbolicLink()) {
      if (type) {
        writePage(fs.readlinkSync(fullPath));
      } else {
        fs.copySync(fullPath, path.join(destDir, entry));
      }
    } else if (stats.isDirectory()) {
      // update directory
      serializeDir(fullPath, destDir, base);
    } else {
      throw new Error('Stat\'ed ' + fullPath + ' but it is neither file, symlink, nor directory')
    }
  }

  /**
   * Check that pages property is in [obj, key] format
   * If yes, deserialize the destination directory and set returned object to target[key]
   */
  if (this.pages && Array.isArray(this.pages) && this.pages.length === 2) {
    var target = this.pages[0];
    var key = this.pages[1];
    target[key] = toPage(destDir);
  }
}

/**
 * Turn a directory of pages in to tree of objects
 * TODO: Remove this function
 * @param dir
 */
function deserializeDir(dir) {
  var files = fixturify.readSync(dir);
  return traverse(files).map(function(value){
    var update = false;
    if (typeof value === 'string') {
      try {
        value = JSON.parse(value);
        update = true;
      }
      catch (error) {
        // do nothing
      }
      if (update) {
        this.update(value);
      }
    }
  });
}

module.exports = PagesPlugin;
module.exports.serializeDir = serializeDir;
module.exports.deserializeDir = deserializeDir;
