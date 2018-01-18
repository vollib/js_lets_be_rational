var gulp = require('gulp');
var coffee = require('gulp-coffee');
var qunit = require('gulp-qunit');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');

// Temporary solution until gulp 4
// https://github.com/gulpjs/gulp/issues/355
var runSequence = require('run-sequence');

// ---------------------------------------------------------------------
// | Helper tasks                                                      |
// ---------------------------------------------------------------------

gulp.task('clean', function (done) {
    require('del')([
        'build',
        'src/coffee/js_lets_be_rational.coffee'
    ]).then(function () {
        done();
    });
});

gulp.task('lint', function () {
    return gulp.src([
        'gulpfile.js',
        'src/js/**/*.js',
        'test/**/*.js'
    ]).pipe(jshint())
      .pipe(jshint.reporter('jshint-stylish'))
      .pipe(jshint.reporter('fail'));
});

gulp.task('coffee', function() {
    return gulp.src('src/coffee/**/*.coffee')
        .pipe(coffee({bare:true}))
        .pipe(gulp.dest('build'));
});

gulp.task('qunit', function(){
    return gulp.src('test/**/*.html')
        .pipe(qunit());
});

gulp.task('concat', function(){
    return gulp.src(['build/lets_be_rational/constants.js',
                    'build/lets_be_rational/errors.js',
                    'build/lets_be_rational/erf_cody.js',
                    'build/lets_be_rational/normaldistribution.js',
                    'build/lets_be_rational/rationalcubic.js',
                    'build/lets_be_rational/lets_be_rational.js',
                    'build/lets_be_rational/js_lets_be_rational.js'])
        .pipe(concat('js_lets_be_rational.js'))
        .pipe(gulp.dest('build'));
});


// ---------------------------------------------------------------------
// | Main tasks                                                        |
// ---------------------------------------------------------------------

gulp.task('build', function (done) {
    runSequence(
        'clean',
        'coffee',
        'concat',
        'check',
    done);
});

gulp.task('check', function(done) {
    runSequence(
        'lint',
        'qunit',
    done);
});

gulp.task('default', ['build']);

gulp.task('test', ['check']);
