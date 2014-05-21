var test = require('tap').test;

var relativePath = require('../lib/utils').relativePath;

test('relativePath', function(t){
  t.equal(relativePath('hello/world'), 'hello/world');
  t.equal(relativePath('hello/world.html'), 'hello/world');
  t.equal(relativePath('hello/world/index'), 'hello/world');
  t.equal(relativePath('hello/world/index.html'), 'hello/world');
  t.equal(relativePath('parent/hello/world', 'parent'), 'hello/world');
  t.end();
});