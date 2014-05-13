var CachingWriter = require('broccoli-caching-writer');
var path = require('path');
var matchHeader = require('./operations').matchHeader;
var fs = require('fs-extra');
var outputJsonSync = require('fs-extra').outputFileSync;
var yaml = require('js-yaml');
var fixturify = require('fixturify');
var traverse = require('traverse');

var PagesDirectory = {};
PagesDirectory.prototype = Object.create(CachingWriter.prototype);
PagesDirectory.prototype.constructor = CachingWriter;
PagesDirectory.prototype.updateCache = serializeDir;

function serializeDir(srcDir, destDir) {

  var entries = fs.readdirSync(srcDir);
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    var fullPath = srcDir + '/' + entry;
    var ext = path.extname(fullPath);
    var basename = path.basename(fullPath);
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
        outputJsonSync(destDir + '/' + basename + '.page', JSON.stringify(page));
      } else {
        console.log('Error: could not extract metadata from', fullPath);
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
        fs.copySync(fullPath, destDir + '/' + entry);
      }
    } else if (stats.isSymbolicLink()) {
      if (type) {
        writePage(fs.readlinkSync(fullPath));
      } else {
        fs.copySync(fullPath, destDir + '/' + entry);
      }
    } else if (stats.isDirectory()) {
      // update directory
      serializeDir(fullPath, destDir)
    } else {
      throw new Error('Stat\'ed ' + fullPath + ' but it is neither file, symlink, nor directory')
    }
  }
}

/**
 * Turn a directory of pages in to tree of objects
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

module.exports = function(inputTree, options) {
  if (!(this instanceof PagesDirectory)) return new PagesDirectory(inputTree, options);

  this.inputTree = inputTree;

  options = options || {};

  for (var key in options) {
    if (options.hasOwnProperty(key)) {
      this[key] = options[key]
    }
  }
};

module.exports.serializeDir = serializeDir;
module.exports.deserializeDir = deserializeDir;
