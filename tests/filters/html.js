var test = require('tap').test;

var HTMLFilter = require('../../lib/filters/html');

var filter = new HTMLFilter();

test("html filter doesn't modify the output", function(t){
  t.equal(filter.processPage('Hello World'), 'Hello World');
  t.end();
});