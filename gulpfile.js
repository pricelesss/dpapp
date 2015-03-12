var gulp = require('gulp');
var ftp = require('gulp-ftp');
var gutil = require('gulp-util');
var isDev = !process.env.ENV || process.env.ENV == "dev";
var ciconfig = require('dpciconfig');

gulp.task('ftp', function () {
  if(isDev)return;

  var ftpConfig = ciconfig('.ftppass');

  gulp.src(['demo.html'])
      .pipe(ftp({
          "host": ftpConfig.host,
          "user": ftpConfig.user,
          "pass": ftpConfig.pass,
          "remotePath": "s/res/dpapp/"
      }))
      .pipe(gutil.noop());

  gulp.src(['dest/**/*'])
    .pipe(ftp({
        "host": ftpConfig.host,
        "user": ftpConfig.user,
        "pass": ftpConfig.pass,
        "remotePath": "s/res/dpapp/dest"
    }))
    .pipe(gutil.noop());
});