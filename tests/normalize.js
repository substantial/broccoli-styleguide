var test = require("tap").test;
var Builder = require('broccoli').Builder;
var normalize = require('../lib/normalize');
var fixturify = require('fixturify');
var quickTemp = require('quick-temp');

test("convert to pagess", function(t){
  t.end();

  quickTemp.makeOrRemake(this, 'tmpSrc');
  quickTemp.makeOrRemake(this, 'tmpDest');

  var files = {
    'file1.html': "---\ntitle: HTML Title\n---\nHTML Body",
    'file2.md': "---\ntitle: Markdown Title\n---\nMarkdown **Body**",
    'file3.hbs': "---\ntitle: Handlebars Title\n---\nHandlebars {{body}}"
  };

  fixturify.writeSync(this.tmpSrc, files);
  normalize(this.tmpSrc, this.tmpDest);
  var built = fixturify.readSync(this.tmpDest);

  t.test("generated files", function(t){
    t.equal(Object.keys(built).length, 3);
    t.ok(built['file1.page']);
    t.type(JSON.parse(built['file1.page']), 'object');
    t.ok(built['file2.page']);
    t.type(JSON.parse(built['file2.page']), 'object');
    t.ok(built['file3.page']);
    t.type(JSON.parse(built['file3.page']), 'object');
    t.end();
  });

});

test('convert files in directory to pages', function(t){

  quickTemp.makeOrRemake(this, 'tmpSrc');
  quickTemp.makeOrRemake(this, 'tmpDest');

  var files = {
    'index.hbs': "---\ntitle: Root-directory file\ndir: /\n---\n",
    'about': {
      'index.hbs': "---\ntitle: Sub-directory file\ndir: /about\n---\n"
    }
  };

  fixturify.writeSync(this.tmpSrc, files);
  normalize(this.tmpSrc, this.tmpDest);
  var built = fixturify.readSync(this.tmpDest);

  t.equal(Object.keys(built).length, 2);
  t.type(built['index.page'], 'string');
  t.type(built['about'], 'object');
  t.type(built['about']['index.page'], 'string');
  t.end();
});

test("doesn't crash on empty files or incorrect syntax", function(t){
  t.plan(1);

  quickTemp.makeOrRemake(this, 'tmpSrc');
  quickTemp.makeOrRemake(this, 'tmpDest');

  var files = {
    'empty.html': "",
    'one-line.md': "\n",
    'only-open.hbs': "---"
  };

  fixturify.writeSync(this.tmpSrc, files);
  normalize(this.tmpSrc, this.tmpDest);
  var built = fixturify.readSync(this.tmpDest);

  t.equal(Object.keys(built).length, 0);

  t.end();
});

test("non pages are transferred to correct directory", function(t){

  quickTemp.makeOrRemake(this, 'tmpSrc');
  quickTemp.makeOrRemake(this, 'tmpDest');

  var files = {
    'index.hbs': "---\ntitle: Index\n---\n",
    'subdir': {
      'test.png': "some text"
    }
  };

  fixturify.writeSync(this.tmpSrc, files);
  normalize(this.tmpSrc, this.tmpDest);
  var built = fixturify.readSync(this.tmpDest);

  t.type(built['test.png'] || void 0, 'undefined', "test.png doesn't exist in root directory");
  t.type(built['subdir'], 'object');
  t.type(built['subdir']['test.png'],'string');

  t.end();
});