var gulp = require('gulp');
var fs = require('fs');
var gutil = require('gulp-util');
var gulpJsdoc2md = require('gulp-jsdoc-to-markdown');
var concat = require('gulp-concat');

var requirejsOptimize = require('gulp-requirejs-optimize');
var sourcemaps = require('gulp-sourcemaps');
require('gulp-watch');
var uglify      = require('gulp-uglify');                   // js压缩
var header      = require('gulp-header');                   // 添加文件头
var rename      = require('gulp-rename');                   // 文件更名
//var sass = require('gulp-sass');
var bom = require('gulp-bom');

// 文件头申明
var banner = [
    '/**',
    ' * utable (http://360uut.cn)',
    ' * Copyright (C) <%= new Date().getFullYear() %> 360uut.cn',
    ' */',
    ''].join('\n');

gulp.task('scripts:release', function () {
    return gulp.src('src/js/jquery.utable.js')
        .pipe(requirejsOptimize(function (file) {
            return {
                name: '../../almond',
                wrapShim: false,
                wrap: {
                    startFile: 'start.frag',
                    endFile: 'end.frag'
                },

                keepBuildDir: false,  //不复制依赖文件
                optimize: 'none',
                preserveLicenseComments: false,
                include: ['jquery.utable'],
                useStrict: true,
                baseUrl: 'src/js',
                mainConfigFile: "./src/js/require-config.js",
                generateSourceMaps: true,
                fileExclusionRegExp:/^jquery/
            };
        }))
        .pipe(bom())
        .pipe(header(banner)) // 头部申明
        .pipe(gulp.dest('./dist/release'))
        .pipe(uglify()) // js压缩
        .pipe(header(banner)) // 头部申明
        .pipe(rename({suffix: '.min'})) // 文件更名(*.min)
        //.pipe(sourcemaps.write())
        .pipe(gulp.dest('./dist/release')); // 输出压缩文件存放目;
});
gulp.task('page',function(){
   return gulp.src('src/js/jquery.page.js')
        .pipe(requirejsOptimize(function (file) {
            return {
                name: '../../almond',
                wrapShim: false,
                wrap: {
                    startFile: 'start-Page.frag',
                    endFile: 'end.page.frag'
                },
                keepBuildDir: false,  //不复制依赖文件
                optimize: 'none',
                preserveLicenseComments: false,
                include: ['jquery.page'],
                useStrict: true,
                baseUrl: 'src/js',
                mainConfigFile: "./src/js/require-config.js",
                generateSourceMaps: true,
                fileExclusionRegExp:/^jquery/
            };
        }))
        .pipe(gulp.dest('./dist/release'))
       .pipe(uglify()) // js压缩
       .pipe(header(banner)) // 头部申明
       .pipe(rename({suffix: '.min'})) // 文件更名(*.min)
       .pipe(gulp.dest('./dist/release')); // 输出压缩文件存放目
});

gulp.task('uutctrl',function(){
    return gulp.src('src/js/UUTCtrl.js')
        .pipe(sourcemaps.init())
        .pipe(requirejsOptimize(function (file) {
            return {
                name: '../../almond',
                wrapShim: false,
                wrap: {
                    startFile: 'uutctrl-start.frag',
                    endFile: 'uutctrl-end.frag'
                },
                keepBuildDir: false,  //不复制依赖文件
                optimize: 'none',
                preserveLicenseComments: false,
                include: ['UUTCtrl'],
                useStrict: true,
                baseUrl: 'src/js',
                mainConfigFile: "./src/js/require-config.js",
                generateSourceMaps: true,
                fileExclusionRegExp:/^jquery/
            };
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dist/release'));
});

gulp.task('css',function(){
   return gulp.src('src/css/*.css')      //压缩的文件
        .pipe(gulp.dest('dist/release'));   //输出文件夹
});

gulp.task('watch', function() {
    gulp.watch(['src/js/*.js', 'src/js/components/**/*.js','src/**/*.css'], ['css','scripts:release']);
});

gulp.task('all',['css','scripts:release',"page"] );

gulp.task('sass', function () {
  return gulp.src('src/css/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('dist/release/css'));
});

/*
gulp.task('sass:watch', function () {
  gulp.watch('src/css/!*.scss', ['sass']);
});*/
