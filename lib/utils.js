var path = require('path');

/**
 * Normalize relativePath and return string
 *
 * hello/world.html - hello/world
 * hello/world/index -> hello/world
 *
 * @param {String} filePath
 * @param {String} base
 * @returns {String}
 */
module.exports.relativePath = function(filePath, base) {
  if (base == null) {
    base = '';
  }
  var basename = path.basename(filePath, path.extname(filePath));
  var relativePath = path.relative(base, path.dirname(filePath));
  if (relativePath !== '' && basename !== 'index') {
    relativePath += '/';
  }
  if (basename !== 'index') {
    relativePath += basename
  }
  return relativePath;
};