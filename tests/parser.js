var test = require('tap').test;

var Parser = require('../lib/parser');

test('parser throws errors', function(t){
  t.plan(4);

  var parser = new Parser;

  t.throws(function(){
    parser.toObject('');
  }, 'empty string');
  t.throws(function(){
    parser.toObject("\n---")
  }, "\n---");
  t.throws(function(){
   parser.toObject();
  }, "undefined");

  var string =  "---\n" +
                "title: Hello\n" +
                "---\n" +
                "World";

  t.deepEqual(parser.toObject(string), {
    title: 'Hello',
    _source: 'World'
  });

  t.end();
});