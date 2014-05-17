var path = require('path');
var fs = require('fs-extra');
var yaml = require('js-yaml');
var matchHeader = require('./operations').matchHeader;

/**
 * Recursive function that
 *
 * @param srcDir
 * @param destDir
 * @param base
 * @returns Page
 */
function normalize(srcDir, destDir, base) {

  if (typeof base === 'undefined') {
    base = srcDir;
  }

  var entries = fs.readdirSync(srcDir);
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    var fullPath = path.join(srcDir, entry);
    var ext = path.extname(fullPath);
    var basename = path.basename(fullPath, ext);
    var relative = path.relative(base, path.dirname(fullPath));
    ext = ext.substring(1);
    var type;
    switch (ext) {
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
      var path = relative;
      if (path !== '' && basename !== 'index') {
        path += '/';
      }
      if (basename !== 'index') {
        path += basename
      }
      page['_path'] = path;
      return page;
    }

    function writePage(string) {
      var page = buildPage(string);
      if (page) {
        fs.outputJSONSync(buildDestPath(basename + '.page'), page);
      } else {
        console.warn('could not extract metadata from', path.relative(process.cwd(), fullPath));
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

    function buildDestPath(fileName) {
      return path.join(destDir, relative, fileName);
    }

    var stats = fs.lstatSync(fullPath);
    if (stats.isFile()) {
      if (type) {
        // convert file to json
        writePage(fs.readFileSync(fullPath, { encoding: 'utf8' }));
      } else {
        // copy file
        fs.copySync(fullPath, buildDestPath(entry));
      }
    } else if (stats.isSymbolicLink()) {
      if (type) {
        writePage(fs.readlinkSync(fullPath));
      } else {
        fs.copySync(fullPath, buildDestPath(entry));
      }
    } else if (stats.isDirectory()) {
      // update directory
      normalize(fullPath, destDir, base);
    } else {
      throw new Error('Stat\'ed ' + fullPath + ' but it is neither file, symlink, nor directory')
    }
  }
}



module.exports = normalize;