// プラグイン
const gulp = require("gulp");
const sass = require("gulp-dart-sass");
const autoprefixer = require("gulp-autoprefixer");
const sassGlob = require("gulp-sass-glob-use-forward");
const sourcemaps = require("gulp-sourcemaps");
const connectSSI = require("connect-ssi");
const browserSync = require("browser-sync");
const cached = require("gulp-cached");
const csscomb = require('gulp-csscomb');
const imagemin = require("gulp-imagemin");
const mozjpeg = require("imagemin-mozjpeg");
const pngquant = require("imagemin-pngquant");
const webp = require("gulp-webp");
// プラグイン

const scss = ['./**/*.scss', '!./common/**/*.scss', '!./node_modules/**/*.scss'];
const base = "./common/**/*.scss";
const all = ['./**/*.scss', '!./node_modules/**/*.scss'];
const slice_img = "./slice_img/**/*.{svg,gif,png,jpg,jpeg}";

// sassコンパイル
gulp.task("sass", (done) => {
 gulp
  .src(scss)
  .pipe(cached(sass))
  .pipe(sourcemaps.init())
  .pipe(sassGlob())
  .pipe(
   sass({
    outputStyle: "expanded",
   })
  )
  .on("error", sass.logError)
  .pipe(csscomb())
  .pipe(autoprefixer())
  .pipe(sourcemaps.write("./"))
  .pipe(gulp.dest("./"));
 done();
});

// baseファイル
gulp.task("base", (done) => {
 gulp
  .src(all)
  .pipe(sourcemaps.init())
  .pipe(sassGlob())
  .pipe(
   sass({
    outputStyle: "expanded",
   })
  )
  .on("error", sass.logError)
  .pipe(csscomb())
  .pipe(autoprefixer())
  .pipe(sourcemaps.write("./"))
  .pipe(gulp.dest("./"));
 done();
});

// ローカル環境
gulp.task("browser-sync", (done) => {
 browserSync.init({
  open: "external",
  server: {
   baseDir: "./",
   index: "index.html",
   middleware: [
    connectSSI({
     baseDir: __dirname,
     ext: ".html",
    }),
   ],
  },
 });
 done();
});

// リロード設定
gulp.task("browser-reload", (done) => {
 browserSync.reload();
 done();
});

//画像圧縮
gulp.task("imagemin", function () {
 return gulp
  .src(slice_img)
  .pipe(cached(imagemin))
  .pipe(
   imagemin([
    pngquant({
     quality: [0.7, 0.8], // 画質
     speed: 1, // スピード
    }),
    mozjpeg({
     quality: 80,
    }), // 画質
    imagemin.svgo(),
    imagemin.optipng(),
    imagemin.gifsicle({
     optimizationLevel: 3,
    }), // 圧縮率
   ])
  )
  .pipe(gulp.dest("./"));
});

//Webp
gulp.task("img-webp", function () {
 return gulp
  .src(slice_img)
  .pipe(cached(webp))
  .pipe(
   webp({
    quality: 80,
   })
  )
  .pipe(gulp.dest("./"));
});

// 監視ファイル
gulp.task("watch-files", (done) => {
 gulp.watch(base, gulp.task("base"));
 gulp.watch(scss, gulp.task("sass"));
 gulp.watch("./**/*.css", gulp.task("browser-reload"));
 gulp.watch("./slice_img/**", gulp.task("imagemin"));
 gulp.watch("./**/img/**", gulp.task("browser-reload"));
 gulp.watch("./*.html", gulp.task("browser-reload"));
 gulp.watch("./**/*.html", gulp.task("browser-reload"));
 gulp.watch("./**/*.js", gulp.task("browser-reload"));
 done();
});

// タスク実行
gulp.task(
 "default",
 gulp.series(gulp.parallel("watch-files", "browser-sync"), (done) => {
  done();
 })
);