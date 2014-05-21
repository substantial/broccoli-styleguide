var test = require('tap').test;
var jsdom = require('jsdom');
var jquery = require('jquery');

function $(html) {

  /* parse the html and create a dom window */
  var window = jsdom.jsdom(html, null, {
    // standard options:  disable loading other assets
    // or executing script tags
    FetchExternalResources: false,
    ProcessExternalResources: false,
    MutationEvents: false,
    QuerySelector: false
  }).createWindow();

  return jquery.create(window);
}


var processPage = require('../../lib/filters/markdown').processPage;

test('render POJO page', function(t){

  var html = processPage({
    title: 'Hello World',
    body: "This is a **beautiful** world."
  });

  var doc = $(html);

  t.equal(doc.find('p').text(), 'This is a beautiful world.');
  t.equal(doc.find('strong').text(), 'beautiful');

  t.end();
});
