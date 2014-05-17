var test = require("tap").test;
var Builder = require('broccoli').Builder;
var serializeDir = require('../lib/plugin').serializeDir;
var deserializeDir = require('../lib/plugin').deserializeDir;
var fixturify = require('fixturify');
var quickTemp = require('quick-temp');

test("build pages", function(t){
  t.end();

  quickTemp.makeOrRemake(this, 'tmpSrc');
  quickTemp.makeOrRemake(this, 'tmpDest');

  var files = {
    'file1.html': "---\ntitle: HTML Title\n---\nHTML Body",
    'file2.md': "---\ntitle: Markdown Title\n---\nMarkdown **Body**",
    'file3.hbs': "---\ntitle: Handlebars Title\n---\nHandlebars {{body}}"
  };

  fixturify.writeSync(this.tmpSrc, files);
  serializeDir(this.tmpSrc, this.tmpDest);

  var built = deserializeDir(this.tmpDest);

  t.test("generated files", function(t){
    t.plan(7);

    t.equal(Object.keys(built).length, 3);

    t.ok(built['file1.page']);
    t.deepEqual(built['file1.page'], {
      title: 'HTML Title',
      type: 'html',
      body: 'HTML Body'
    });

    t.ok(built['file2.page']);
    t.deepEqual(built['file2.page'], {
      title: 'Markdown Title',
      type: 'markdown',
      body: 'Markdown **Body**'
    });

    t.ok(built['file3.page']);
    t.deepEqual(built['file3.page'], {
      title: 'Handlebars Title',
      type: 'handlebars',
      body: 'Handlebars {{body}}'
    });

    t.end();
  });

});

test('build pages in directories', function(t){

  quickTemp.makeOrRemake(this, 'tmpSrc');
  quickTemp.makeOrRemake(this, 'tmpDest');

  var files = {
    'index.hbs': "---\ntitle: Root-directory file\ndir: /\n---\n",
    'about': {
      'index.hbs': "---\ntitle: Sub-directory file\ndir: /about\n---\n"
    }
  };

  fixturify.writeSync(this.tmpSrc, files);
  serializeDir(this.tmpSrc, this.tmpDest);
  var generated = fixturify.readSync(this.tmpDest);

  t.equal(Object.keys(generated).length, 2);
  t.type(generated['index.page'], 'string');
  t.type(generated['about'], 'object');
  t.type(generated['about']['index.page'], 'string');

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
  serializeDir(this.tmpSrc, this.tmpDest);

  var built = deserializeDir(this.tmpDest);

  t.equal(Object.keys(built).length, 0);

  t.end();
});