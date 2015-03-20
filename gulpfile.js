var gulp = require('gulp');
var ftp = require('gulp-ftp');
var gutil = require('gulp-util');
var ciconfig = require('dpciconfig');
// standalone.sh 会把./dest/standalone.js build到ci正确的构建目录下，
// 这里只做demo上传
gulp.task('ftp', function () {

  var ftpConfig = ciconfig('.ftppass');

  gulp.src(['demo/**/*'])
    .pipe(ftp({
        "host": ftpConfig.host,
        "user": ftpConfig.user,
        "pass": ftpConfig.pass,
        "remotePath": "s/res/dpapp/demo"
    }))
    .pipe(gutil.noop());
});