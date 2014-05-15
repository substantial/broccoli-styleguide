var fixturify = require('fixturify');
var path = require('path');

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
      this.key = values[key];
    }
  }

  this.parent = parent;
  this.pages = pages;
}

Page.prototype.parent = null;
Page.prototype.pages = null;

function toPage(dir, parent) {

  if (typeof dir === 'string') {
    dir = fixturify.readSync(dir);
  }

  var pages = {};
  var values;

  if (dir.hasOwnProperty('index.page')) {
    values = JSON.parse(dir['index.page']);
    delete dir['index.page'];
  }

  var page = new Page(parent, values, pages);

  for (var name in dir) {
    if (dir.hasOwnProperty(name)) {
      if (typeof dir[name] === 'string') {
        pages[path.basename(name, path.extname(name))] = new Page(page, JSON.parse(dir[name]), null);
      } else {
        pages[name] = toPage(dir[name], page);
      }
    }
  }

  return page;
}

module.exports = Page;
module.exports.toPage = toPage;