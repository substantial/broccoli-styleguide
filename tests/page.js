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
      'file1.html': "---\ntitle: Handlebars Title\n---\nHandlebars {{body}}",
      'file2.md': "---\ntitle: Markdown Title\n---\nMarkdown **Body**"
    }
  };

  fixturify.writeSync(this.tmpSrc, files);
  normalize(this.tmpSrc, this.tmpDest);

  var page = toPage(this.tmpDest);

  t.type(page.pages, 'object');
  t.type(page.title, 'string');
  t.type(page.body, 'string');
  t.equal(page.title, 'Index File');
  t.equal(page.body, 'Index Body');

  t.type(page.pages.about, 'object');
  t.equal(page.pages.about.parent, page);

  t.type(page.pages.about.pages.file1, 'object');
  t.equal(page.pages.about.pages.file1.parent, page.pages.about);

  t.end();
});