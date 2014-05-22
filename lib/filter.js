var util    = require('util');
var path    = require('path');
var fs      = require('fs-extra');
var Filter  = require('broccoli-filter');
var Promise = require('rsvp').Promise;

var Page          = require('./page');
var utils         = require('./utils');

function PageFilter(inputTree, options) {
  if (!(this instanceof PageFilter)) return new PageFilter(inputTree, options);
  Filter.call(this, inputTree, options);

  this.pages = (options) ? options.pages || null : null;
  this.options = options;
}
util.inherits(PageFilter, Filter);
PageFilter.prototype.extensions = ['page'];
PageFilter.prototype.targetExtension = 'html';
PageFilter.prototype.pages = null;
PageFilter.prototype.getFilter = function(filterName) {
  var filter;
  var filters = this.getFilters();
  if (filters.hasOwnProperty(filterName)) {
    filter = filters[filterName];
    if (!(filter instanceof PageFilter)) {
      filter = new filter(null, this.options[filterName] || {});
    }
  }
  return filter;
};
PageFilter.prototype.getFilters = function() {
  var filters;
  if (this.pages && this.pages.filters) {
    filters = this.pages.filters;
  } else {
    filters = require('./filters');
  }
  return filters;
},
/**
 * Process the source of the page and return HTML
 * @param {String} source
 * @param {Page} page
 * @returns {string}
 */
PageFilter.prototype.processPage = function(source, page) {
  throw "processPage must be implemented on descendants of PageFilter class.";
};
PageFilter.prototype.processFile = function (srcDir, destDir, relativePath) {
  var self = this;
  var data = Page.fromFile(srcDir + '/' + relativePath, utils.relativePath(relativePath, null), false);
  var pages = this.pages;
  var page;
  if (pages && pages.root) {
    var fromMemory = pages.root.getPage(data._path);
    if (fromMemory) {
      page = fromMemory;
    }
  }
  if (!page) {
    page = new Page(null, data, null);
  }
  var filter = page._filter = this.getFilter(page._filterName);
  return Promise.resolve(filter.processPage(page._source, page))
    .then(function (outputString) {
      var outputPath = self.getDestFilePath(relativePath);
      fs.writeFileSync(destDir + '/' + outputPath, outputString, { encoding: 'utf8' })
    })
};

module.exports = PageFilter;