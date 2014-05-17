var Filter = require('broccoli-filter');

function PagesFilter (inputTree, options) {
  if (!(this instanceof PagesFilter)) return new PagesFilter(inputTree, options);
  Filter.call(this, inputTree, options);

  options = options || {};

  for (var key in options) {
    if (options.hasOwnProperty(key)) {
      this[key] = options[key]
    }
  }

  this.options = options;
}

PagesFilter.prototype = Object.create(Filter.prototype);
PagesFilter.prototype.constructor = PagesFilter;
PagesFilter.prototype.extensions = ['page'];
PagesFilter.prototype.targetExtension = 'html';
PagesFilter.prototype.pages = null;

PagesFilter.prototype.processString = function(string) {
  var page;
  try {
    page = JSON.parse(string);
  } catch (e) {
    console.log("Could not parse:", string);
  }

  return page.body;
};

module.exports = PagesFilter;