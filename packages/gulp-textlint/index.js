var gutil = require('gulp-util');
var through = require('through2');
var TextLintEngine = require('textlint').TextLintEngine;

module.exports = function(options) {
  options = options || {};
  var textlint = new TextLintEngine(options);
  var filePaths = [];

  return through.obj(function(file, enc, cb) {
    filePaths.push(file.path);
    this.push(file);
    cb();
  }, function(cb) {
    var that = this;
    textlint.executeOnFiles(filePaths).then(function (results) {
      if (textlint.isErrorResults(results)) {
        gutil.log(textlint.formatResults(results));
        that.emit('error', new gutil.PluginError('textlint','Lint failed.'));
      }
    }).catch(function(error){
      that.emit('error', new gutil.PluginError('textlint', 'Lint failed.'))
    }).then(function() {
      cb();
    });
  });
};
