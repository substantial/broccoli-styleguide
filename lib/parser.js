var merge = require('lodash-node').merge;

function Parser() {
  if (!(this instanceof Parser)) return new Parser();
}
Parser.prototype.constructor = Parser;
/**
 * Pattern used to split the header
 * @type {RegExp}
 */
Parser.prototype.splitPattern = /^-{3,}\s([\s\S]*?)-{3,}(\s[\s\S]*|\s?)$/;
Parser.prototype.split = function(string) {

  var pattern = new RegExp(this.splitPattern);

  if (string.slice(0, 3) !== '---') {
    throw new Error('--- was not found at the top of the page');
  }
  if (string.split("---\n").length < 2) {
    throw new Error('Page must contain two --- separators');
  }
  if (!pattern.test(string)) {
    throw new Error('Could not split page into header and body')
  }
  var parts = string.match(pattern);
  // remove starting linebreak if its present
  if (parts[2].substring(0, 1) === "\n") {
    parts[2] = parts[2].substring(1);
  }
  return [parts[1], parts[2]];
};
Parser.prototype.toObject = function(string) {

  var yaml = require('js-yaml');
  var page = {};
  var header = {};

  var parts = this.split(string);

  page['_source'] = parts[1];

  try {
    header = yaml.load(parts[0])
  } catch (e) {
    console.log('Failed to parse the page header into an object');
  }

  return merge(page, header);
};

module.exports = Parser;