var test = require("tap").test;
var Builder = require('broccoli').Builder;
var jsonify = require('../lib/jsonify');
var objectify = require('../lib/jsonify').objectify;
var fixturify = require('fixturify');
var quickTemp = require('quick-temp');

test("files are converted to JSON", function(t){
  t.end();

  var updateCache = jsonify.updateCache;

  quickTemp.makeOrRemake(this, 'tmpSrc');
  quickTemp.makeOrRemake(this, 'tmpDest');

  var files = {
    'file.html': "---\ntitle: HTML Title\n---\nHTML Body",
    'file.md': "---\ntitle: Markdown Title\n---\nMarkdown **Body**",
    'file.hbs': "---\ntitle: Handlebars Title\n---\nHandlebars {{body}}"
  };

  fixturify.writeSync(this.tmpSrc, files);
  updateCache(this.tmpSrc, this.tmpDest);

  var built = objectify(this.tmpDest);

  t.equal(Object.keys(built).length, 3);

  t.ok(built['file.html.page']);
  t.deepEqual(built['file.html.page'], {
    title: 'HTML Title',
    type: 'html',
    body: 'HTML Body'
  });

  t.ok(built['file.md.page']);
  t.deepEqual(built['file.md.page'], {
    title: 'Markdown Title',
    type: 'markdown',
    body: 'Markdown **Body**'
  });

  t.ok(built['file.hbs.page']);
  t.deepEqual(built['file.hbs.page'], {
    title: 'Handlebars Title',
    type: 'handlebars',
    body: 'Handlebars {{body}}'
  })

});
