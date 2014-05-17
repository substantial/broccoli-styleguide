var test = require("tap").test;
var fixturify = require('fixturify');
var quickTemp = require('quick-temp');

var normalize = require('../lib/normalize');
var toPage = require('../lib/page').toPage;

test("toPage with nested objects", function(t){

  quickTemp.makeOrRemake(this, 'tmpSrc');
  quickTemp.makeOrRemake(this, 'tmpDest');

  var files = {
    'index.hbs': "---\ntitle: Index File\n---\nIndex Body",
    'file1.html': "---\ntitle: HTML Title\n---\nHTML Body",
    'file2.md': "---\ntitle: Markdown Title\n---\nMarkdown **Body**",
    'about': {
      'file1.html': "---\ntitle: About -> File1\n---\nHandlebars {{body}}",
      'file2.md': "---\ntitle: About -> File2\n---\nMarkdown **Body**"
    },
    'about.md': "---\ntitle: About\n---\nMarkdown **Body**"
  };

  fixturify.writeSync(this.tmpSrc, files);
  normalize(this.tmpSrc, this.tmpDest);

  var page = toPage(this.tmpDest);

  t.test("presence & types", function(t) {
    t.plan(9);
    t.type(page._, 'object');
    t.type(page.title, 'string');
    t.type(page.body, 'string');
    t.equal(page.title, 'Index File');
    t.equal(page.body, 'Index Body');
    t.type(page._.about, 'object');
    t.equal(page._.about.parent, page);
    t.type(page._.about._.file1, 'object');
    t.equal(page._.about._.file1.parent, page._.about);
    t.end();
  });

  t.test('page and directory with same name are merged', function(t){
    t.type(page._.about._, 'object');
    t.equal(Object.keys(page._.about._).length, 2);
    t.end();
  });

  t.test('paths', function(t){
    t.plan(3);
    t.equal(page._path, '');
    t.equal(page._.file1._path, 'file1');
    t.equal(page._.about._.file1._path, 'about/file1');
    t.end();
  });

  t.test('getRoot', function(t){
    t.plan(3);
    t.equal(page.getRoot(), page);
    t.equal(page._.about.getRoot(), page);
    t.equal(page._.about._.file1.getRoot(), page);
    t.end();
  });

  t.test('getPage', function(t){
    t.equal(page.getPage('about/file1'), page._.about._.file1, "about/file1");
    t.type(page.getPage(), 'null', 'no param, returns null');
    t.equal(page._.about.getPage(''), page._.about, 'empty string returns called page');
    t.equal(page._.about._.file1.getPage('/file2'), page._.file2, 'absolute returns from root');
    t.end();
  });

  t.end();
});