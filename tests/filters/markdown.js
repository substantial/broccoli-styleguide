var test = require('tap').test;

var MarkdownFilter = require('../../lib/filters/markdown');

var filter = new MarkdownFilter('mock');

test('markdown renders', function(t){
  t.equal(filter.processPage('Hello **World**', null), '<p>Hello <strong>World</strong></p>');
  t.end();
});
