// プラグイン
const gulp = require("gulp");
const sass = require("gulp-dart-sass");
const autoprefixer = require("gulp-autoprefixer");
const sassGlob = require("gulp-sass-glob-use-forward");
const sourcemaps = require("gulp-sourcemaps");
const connectSSI = require("connect-ssi");
const browserSync = require("browser-sync");
const cached = require("gulp-cached");
const csscomb = require("gulp-csscomb");
const imagemin = require("gulp-imagemin");
const mozjpeg = require("imagemin-mozjpeg");
const pngquant = require("imagemin-pngquant");
// const webp = require("gulp-webp");
const del = require("del");
const $ = require("gulp-load-plugins")({
	pattern: ["del"], // del パッケージを読み込む
	overridePattern: false, // デフォルトのパターン ('gulp-*', 'gulp.*', '@*/gulp{-,.}*') を残す
	maintainScope: false, // スコープパッケージを階層化しない
});
// プラグイン

const scss = [
	"./**/*.scss",
	"!./common/**/*.scss",
	"!./node_modules/**/*.scss",
];
const base = "./common/**/*.scss";
const all = ["./**/*.scss", "!./node_modules/**/*.scss"];
const slice_img = "./slice_img/**/*.{svg,gif,png,jpg,jpeg}";
// const slice_img = "./slice_img/**";
// const slice_img = [
// 	"./**/*.{svg,gif,png,jpg,jpeg}",
// 	"!./node_modules/**/*.{svg,gif,png,jpg,jpeg}",
// ];
const compressed = [
	"./**/*.{svg,gif,png,jpg,jpeg}",
	"!./slice_img/**/*.{svg,gif,png,jpg,jpeg}",
	"!./node_modules/**/*.{svg,gif,png,jpg,jpeg}",
	"!./**/mailformpro/*.{svg,gif,png,jpg,jpeg}",
	"!./**/mfp.statics/*.{svg,gif,png,jpg,jpeg}",
];

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

//画像を削除
gulp.task("delete", (done) => {
	del(compressed);
	console.log("DEBUG:削除");
	done();
});

//画像圧縮
gulp.task("imgmin", (done) => {
	gulp
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
					optimizationLevel: 1,
				}), // 圧縮率
			])
		)
		.pipe(gulp.dest("./"));
	console.log("DEBUG:圧縮");
	done();
});

gulp.task(
	"compress-images",
	gulp.series("delete", "imgmin", (done) => {
		console.log("DEBUG:圧縮完了");
		done();
	})
);

//Webp
// gulp.task("img-webp", function () {
// 	return gulp
// 		.src(slice_img)
// 		.pipe(cached(webp))
// 		.pipe(
// 			webp({
// 				quality: 80,
// 			})
// 		)
// 		.pipe(gulp.dest("./"));
// });

gulp.task("d", (done) => {
	console.log("DEBUG:削除");
	done();
});
gulp.task("a", (done) => {
	console.log("DEBUG:追加");
	done();
});
gulp.task("c", (done) => {
	console.log("DEBUG:リネーム");
	done();
});

gulp.task("watch_delete", () => {
	// gulp-watch を使用し、src ディレクトリ配下の HTML ファイルを監視する
	$.watch("./slice_img/**/*.{svg,gif,png,jpg,jpeg}", (file) => {
		if (file.event === "unlink") {
			// ファイルが削除された時は、src ディレクトリのパスを dist に置換し、出力先ファイルを削除する
			return $.del(file.path.replace(/slice_img/, ""));
		}
	});
});

// 監視ファイル
gulp.task("watch-files", (done) => {
	gulp.watch(base, gulp.task("base"));
	gulp.watch(scss, gulp.task("sass"));
	gulp.watch("./**/*.css", gulp.task("browser-reload"));
	gulp.watch(slice_img, gulp.task("imgmin"));
	gulp.watch(slice_img, { events: "unlink" }, gulp.task("watch_delete"));
	// gulp.watch(slice_img, gulp.task("watch_delete"));
	// gulp.watch(
	// 	"./slice_img/**/*.{svg,gif,png,jpg,jpeg}",
	// 	{ events: "add" },
	// 	gulp.task("a")
	// );
	// gulp.watch(
	// 	"./slice_img/**/*.{svg,gif,png,jpg,jpeg}",
	// 	{ events: "change" },
	// 	gulp.task("c")
	// );
	gulp.watch(compressed, gulp.task("browser-reload"));
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
