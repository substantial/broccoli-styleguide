var test = require('tap').test;

var HandlebarsFilter = require('../../lib/filters/handlebars');

var filter = new HandlebarsFilter();

filter.pages = {
  globals: {
    message: "Hello World"
  }
};

test('page renders', function(t){
  t.equal(filter.processPage('{{hello}}', {
    hello: "world"
  }), 'world');
  t.equal(filter.processPage('{{@globals.message}}'), "Hello World");
  t.end();
});