const gulp = require('gulp')
const uglify = require('gulp-uglify')
const sass = require('gulp-sass')
const cleanCSS = require('gulp-clean-css')
const flatten = require('gulp-flatten')
const concat = require('gulp-concat')
const rename = require('gulp-rename')

function javascript () {
  return gulp.src([
    'node_modules/jquery/dist/jquery.js',
    'node_modules/popper.js/dist/umd/popper.js',
    'node_modules/bootstrap/dist/js/bootstrap.js',
    'node_modules/moment/moment.js',
    'node_modules/jplayer/dist/jplayer/jquery.jplayer.js',
    'src/js/clippy.js',
    'src/js/ejs.js',
    'src/js/randomvictory.js'], { base: '.' })
    .pipe(uglify())
    .pipe(concat('randomvictory.min.js'))
    .pipe(gulp.dest('rootPath/js/'))
}

function css () {
  return gulp.src('src/style/randomvictory.scss')
    .pipe(sass({ paths: [ '.' ] }))
    .pipe(cleanCSS())
    .pipe(rename('randomvictory.min.css'))
    .pipe(gulp.dest('rootPath/css/'))
}

function jplayer () {
  return gulp.src(['node_modules/jplayer/dist/jplayer/jquery.jplayer.swf'], { base: '.' })
    .pipe(gulp.dest('rootPath/js/'))
}

function fonts () {
  return gulp.src(['node_modules/font-awesome/fonts/*'], { base: './' })
    .pipe(flatten())
    .pipe(gulp.dest('rootPath/fonts/'))
}

exports.default = gulp.series(javascript, css, jplayer, fonts)
