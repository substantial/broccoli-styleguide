var fixturify   = require('fixturify');
var path        = require('path');
var merge       = require('lodash-node').merge;

/**
 *
 * @param {Object} parent
 * @param {Object} values
 * @param {array} pages
 * @returns {Page}
 * @constructor
 */
function Page(parent, values, pages) {
  if (!(this instanceof Page)) return new Page(parent, values, pages);

  for (var key in values) {
    if (values.hasOwnProperty(key)) {
      this[key] = values[key];
    }
  }

  this.parent = parent;
  this._ = pages;
}

/**
 * Reference to parent Page instance
 * @type {Page|null}
 */
Page.prototype.parent = null;

/**
 * Hash of Page instances that are under current page (current page is in effect a directory)
 * @type {Object|null}
 * @private
 */
Page.prototype._ = null;

/**
 * Relative path of the file
 * @type {String|null}
 * @private
 */
Page.prototype._path = null;

/**
 * Return child page based on path
 * @param {String} path
 * @return {Page}
 */
Page.prototype.getPage = function(path) {
  var page = null;
  var root = this;
  if (typeof path === 'string') {
    var isAbsolute = path.substring(0,1) === '/';
    if (isAbsolute) {
      root = this.getRoot();
      path = path.substring(1);
    } else {
      root = this;
    }
    page = this;
    var parts = path.split('/');
    for (var i = 0; i < parts.length; i++) {
      var key = parts[i];
      if (root._ && root._.hasOwnProperty(key)) {
        if (i === parts.length - 1) {
          page = root._[key];
        } else {
          root = root._[key];
        }
      } else {
        break;
      }
    }
  }
  return page;
};

/**
 * Get the root of the page tree
 * @returns {Page}
 */
Page.prototype.getRoot = function() {
  var root = null;
  if (this.parent) {
    root = this.parent.getRoot();
  } else {
    root = this;
  }
  return root;
};

function toPage(dir, parent, data) {

  if (typeof dir === 'string') {
    try {
      dir = fixturify.readSync(dir);
    } catch (e) {
      return;
    }
  }

  var pages = {};

  if (typeof data === 'undefined') {
    data = {};
  }

  if (dir.hasOwnProperty('index.page')) {
    var index = {};
    try {
      index = JSON.parse(dir['index.page']);
    } catch (e) {
      console.warn('Could not parse: index.page');
    }
    data = merge(data, index);
    delete dir['index.page'];
  }

  var page = new Page(parent, data, pages);

  var dirs = Object.keys(dir).filter(function(name){
    return path.extname(name) === '' && typeof dir[name] === 'object';
  });

  var files = Object.keys(dir).filter(function(name){
    return path.extname(name) === '.page' && typeof dir[name] === 'string';
  });

  var values = {};
  files.forEach(function(name){
    try {
      values[name] = JSON.parse(dir[name]);
    } catch (e) {
      console.warn("Could not parse:", name);
    }
  });

  dirs.forEach(function(name){
    var data = {};
    var pageName = name + '.page';
    if (values.hasOwnProperty(pageName)){
      data = values[pageName];
      delete values[pageName];
    }
    pages[name] = toPage(dir[name], page, data);
  });

  Object.keys(values).forEach(function(name){
    pages[path.basename(name, path.extname(name))] = new Page(page, values[name], null);
  });

  return page;
}

module.exports = Page;
module.exports.toPage = toPage;