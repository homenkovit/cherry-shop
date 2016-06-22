'use strict';

/* --------- api --------- */
// gulp - watching
// gulp sprite - sprite generation
// gulp clean - clean build

/* --------- components --------- */
var gulp         = require('gulp'),
    concat       = require('gulp-concat'),
    browserSync  = require('browser-sync').create(),
    uglify       = require('gulp-uglify'),
    sass         = require('gulp-sass'),
    sourcemaps   = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    postcss      = require('gulp-postcss'),
    assets       = require('postcss-assets'),
    jade         = require('gulp-jade'),
    spritesmith  = require('gulp.spritesmith'),
    clean        = require('gulp-rimraf'),
    imagemin     = require('gulp-imagemin'),
    plumber      = require('gulp-plumber'),
    notify       = require('gulp-notify');

/* --------- paths --------- */
var paths = {
  sass: {
    src: 'dev/sass/**/*.sass',
    location: 'dev/sass/main.sass',
    destination: 'build/css'
  },

  js: {
    src: 'dev/js/**/*.js',
    plug: 'dev/plugins/**/*.js',
    destination: 'build/js'
  },

  jade: {
    src: 'dev/jade/**/*.jade',
    location: 'dev/jade/pages/*.jade',
    destination: 'build'
  }
};

/* -------- gulp server  -------- */
gulp.task('server', function () {
  browserSync.init({
    server: {
      baseDir: ["dev", "build"]
    },
    // proxy: "localhost:8888",
    notify: false
  });
});

/* ----- jade ----- */
gulp.task('jade-compile', function () {
  gulp.src(paths.jade.location)
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(jade())
    .pipe(gulp.dest(paths.jade.destination))
    .pipe(browserSync.stream());
});

/* ------ sass ------ */
gulp.task('sass-compile', function () {
  gulp.src(paths.sass.location)
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(sourcemaps.init())
    .pipe(sass.sync({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(autoprefixer({
          browsers: ['last 2 versions', 'ie >= 9', 'and_chr >= 2.3']
        }))
    .pipe(postcss([
      assets({
        basePath: './dev/',
        loadPaths: ['images/']
      })
    ]))
    // .pipe(concat("main.min.css"))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.sass.destination))
    .pipe(browserSync.stream());
});

/* -------- concat js custom -------- */
gulp.task('concat-js', function () {
  return gulp.src(paths.js.src)
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(sourcemaps.init())
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.js.destination))
    .pipe(browserSync.stream());
});

/* -------- concat js plugins -------- */
gulp.task('concat-js-plugins', function() {
  return gulp.src(['./dev/plugins/jquery/dist/jquery.min.js'
    ])
    .pipe(plumber())
    .pipe(concat('plugins.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.js.destination))
    .pipe(browserSync.stream());
});

/* -------- concat js plugins (head) -------- */
gulp.task('concat-js-plugins-head', function() {
  return gulp.src('./dev/plugins/modernizr-custom.js')
    .pipe(plumber())
    .pipe(concat('plugins-head.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.js.destination))
    .pipe(browserSync.stream());
});

/* -------- images -------- */
gulp.task('images', function () {
  return gulp.src('dev/images/*.+(png|jpg|jpeg|gif|svg)')
    .pipe(imagemin({
        progressive: true,
        interlaced: true
    }))
    .pipe(gulp.dest('build/images/'));
});

/* -------- favicon -------- */
gulp.task('favicon', function () {
  return gulp.src('dev/images/favicon/*.+(ico|png|json|svg|xml)')
    .pipe(gulp.dest('build/images/favicon/'));
});

/* -------- fonts -------- */
gulp.task('fonts', function () {
  return gulp.src('dev/fonts/**/*.+(eot|svg|ttf|woff|woff2)')
    .pipe(gulp.dest('build/fonts/'));
});

/* -------- clean build/js -------- */
gulp.task('clean', function() {
  return gulp.src('build/**/*.*', { read: false })
    .pipe(clean());
});

/* -------- auto sprites  -------- */
gulp.task('sprite', function () {
  var spriteData = gulp.src('dev/images/sprites/*.png')
    .pipe(spritesmith({
      imgName: 'sprite.png',
      imgPath: '../build/images/sprite.png',
      cssName: '_sprite.sass',
      padding: 20,
      algorithm: 'left-right'
    }));
  spriteData.img.pipe(gulp.dest('build/images/'));
  spriteData.css.pipe(gulp.dest('dev/sass/_common'));
});

/* -------- gulp watching  -------- */
gulp.task('watch', function () {
  gulp.watch(paths.jade.src, ['jade-compile']);
  gulp.watch(paths.sass.src, ['sass-compile']);
  gulp.watch(paths.js.src, ['concat-js']);
  gulp.watch(paths.js.plug, ['concat-js-plugins']);
  gulp.watch('dev/images/*.+(png|jpg|jpeg|gif|svg)', ['images']);
  gulp.watch('dev/images/favicon/*.+(ico|png|json|svg|xml)', ['favicon']);
  gulp.watch('dev/fonts/**/*.+(eot|svg|ttf|woff|woff2)', ['fonts']);
  gulp.watch([
    'build/*.html',
    'build/css/*.css',
    'build/js/*.js'
  ]).on('change', browserSync.reload);
});

gulp.task('default', [
  'jade-compile',
  'sass-compile',
  'concat-js',
  'concat-js-plugins',
  'concat-js-plugins-head',
  'images',
  'favicon',
  'fonts',
  'server',
  'watch'
]);

// ===================== Functions ======================

// Working with the errors
var log = function (error) {
  console.log([
    '',
    "----------ERROR MESSAGE START----------",
    ("[" + error.name + " in " + error.plugin + "]"),
    error.message,
    "----------ERROR MESSAGE END----------",
    ''
  ].join('\n'));
  this.end();
}
