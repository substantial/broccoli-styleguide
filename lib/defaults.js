module.exports = {
  templates: './templates', // template directory where Handlebars template will be loaded from,
  helpers: './helpers', // path to directory where the helpers can be found
  partials: './templates/partials', // path to directory where partials are

  extensions: ['css', 'scss', 'less'],
  targetExtension: 'hbs',
  
  // global values that will be included in context when rendering the template
  globals: {

  }
};
