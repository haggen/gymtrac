var fs, path, uglifyjs, uglifycss, temp, code;

path = require('path');
fs = require('fs');
uglifycss = require('uglifycss');
uglifyjs = require('uglify-js');

code = '// ' + new Date() + '\n';
temp = '';

[
  'client/assets/javascript/jquery.js',
  'client/assets/javascript/knockout.js',
  'client/assets/javascript/cookies.js',
  'client/assets/javascript/way.js',
  'client/assets/javascript/ko.app.js',
  'client/assets/javascript/ko.resource.js',
  'client/assets/javascript/moment.js',
  'client/assets/javascript/application.js'
].forEach(function(path) {
  temp = fs.readFileSync(path, 'utf-8');
  temp = uglifyjs.parser.parse(temp);
  temp = uglifyjs.uglify.ast_mangle(temp);
  temp = uglifyjs.uglify.ast_squeeze(temp);
  temp = uglifyjs.uglify.gen_code(temp);

  code += temp + ";\n";
});

fs.writeFileSync('server/public/js/app.js', code);

code = '/* ' + new Date() + ' */\n';
temp = '';

[
  'client/assets/stylesheets/normalize.css',
  'client/assets/stylesheets/h5bp.css',
  'client/assets/stylesheets/style.css'
].forEach(function(path) {
  temp = fs.readFileSync(path, 'utf-8');
  temp = uglifycss.processString(temp, { maxLineLen: 0 });

  code += temp + "\n";
});

fs.writeFileSync('server/public/css/app.css', code);
