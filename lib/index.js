module.exports                = require('./pages');
module.exports.default        = require('./defaults');
module.exports.MarkdownPages  = require('./filters/markdown');
module.exports.HTMLPages      = require('./filters/html');
module.exports.HBSPages       = require('./filters/handlebars');
module.exports.plugin         = require('./plugin');