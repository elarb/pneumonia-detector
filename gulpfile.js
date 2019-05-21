const gulp = require('gulp');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const del = require('del');

const imagemin = require('gulp-imagemin');
const imageresize = require('gulp-image-resize');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminGuetzli = require('imagemin-guetzli');
const webp = require('gulp-webp');

/**
 * Cleans the prpl-server build in the server directory.
 */
gulp.task('prpl-server:clean', () => {
  return del('server/build');
});

/**
 * Copies the prpl-server build to the server directory while renaming the
 * node_modules directory so services like App Engine will upload it.
 */
gulp.task('prpl-server:build', () => {
  const pattern = 'node_modules';
  const replacement = 'node_assets';

  return gulp.src('build/**')
    .pipe(rename(((path) => {
      path.basename = path.basename.replace(pattern, replacement);
      path.dirname = path.dirname.replace(pattern, replacement);
    })))
    .pipe(replace(pattern, replacement))
    .pipe(gulp.dest('server/build'));
});

gulp.task('prpl-server', gulp.series(
  'prpl-server:clean',
  'prpl-server:build'
));

/**
 * Builds the Firebase-ready version of the PWA,
 * moving the necessary files to the functions folder to be used by PRPL Server
 */
gulp.task('firebase', (cb) => {
  // These are the files needed by PRPL Server, that are going to be moved to the functions folder
  const filesToMove = ['build/polymer.json', 'build/**/index.html'];
  // Delete the build folder inside the functions folder
  del(['functions/build'])
    .then(() =>
      // Copy the files needed by PRPL Server
      new Promise((resolve) =>
        gulp
          .src(filesToMove, {base: '.'})
          .pipe(gulp.dest('functions'))
          .on('end', resolve)))
    // Delete them from the original build
    .then(() => del(filesToMove))
    .then(() => cb());
});

/**
 * Optimizes images
 */
// https://github.com/goiblas/gulp-image-optimization/blob/fb104225ccbf91e3b46c91de46e21618452e38b9/gulpfile.js
gulp.task('png', () =>
  gulp.src('img/**/*.{svg,png}')
    .pipe(imagemin([
      imagemin.optipng(),
      imagemin.svgo({
        plugins: [
          {removeViewBox: true},
          {cleanupIDs: false}
        ]
      })
    ]))
    .pipe(gulp.dest('images'))
);

gulp.task('mozjpeg', () =>
  gulp.src('img/**/*.jpg')
    .pipe(imagemin([imageminMozjpeg({
      quality: 85
    })]))
    .pipe(gulp.dest('images'))
);

gulp.task('resize', () =>
  gulp.src('images/**/*.{jpg,png}')
    .pipe(imageresize({width: 1024, crop: false, upscale: false}))
    .pipe(gulp.dest('images'))
);

gulp.task('webp', () =>
  gulp.src('images/**/*.{jpg,png}')
    .pipe(webp({
      quality: 70,
      preset: 'photo',
      method: 6
    }))
    .pipe(gulp.dest('images'))
);

gulp.task('favicon', () =>
  gulp.src('img/favicon.ico')
    .pipe(gulp.dest('images'))
);

gulp.task('optimize-images', gulp.series(gulp.parallel(['png', 'mozjpeg']), 'resize', 'webp', 'favicon'));
