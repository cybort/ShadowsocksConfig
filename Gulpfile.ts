/// <reference types="gulp" />

const gulp = require('gulp');
const runSequence = require('run-sequence');
const gulpLoadPlugins = require('gulp-load-plugins');
const map = require('map-stream');

const plugins = gulpLoadPlugins();

// ----------------------------- GitHub Statuses ------------------------------
import { Repository, Statuses, StatusOptions } from 'commit-status-reporter';
const githubRepository = new Repository(
  'uProxy',
  'ShadowsocksConfig',
  plugins.util.env.GITHUB_TOKEN,
);
console.log('Reporting on commit:', plugins.util.env.COMMIT);
const githubCommit = githubRepository.commit(plugins.util.env.COMMIT);
// ----------------------------------------------------------------------------

const moduleCompatibilityHeader = `(function iife() {
  const platformExportObj = (function detectPlatformExportObj() {
    if (typeof module !== 'undefined' && module.exports) {
      return module.exports;  // node
    } else if (typeof window !== 'undefined') {
      return window;  // browser
    }
    throw new Error('Could not detect platform global object (no window or module.exports)');
  })();`;

const moduleCompatibilityFooter = `})();`;

gulp.task('build:lib', () => {
  const tsProject = plugins.typescript.createProject('tsconfig.json');

  return gulp.src([
      'shadowsocks_config.ts',
    ])
    // Handle source maps manually rather than having tsc generate them because we
    // modify the output of tsc.
    .pipe(plugins.sourcemaps.init())
    .pipe(tsProject())
    .once('error', function () {
      this.once('finish', () => process.exit(1))
    })
    .pipe(plugins.replace(
      'Object.defineProperty(exports, "__esModule", { value: true });',
      moduleCompatibilityHeader
    ))
    .pipe(plugins.replace(
      'exports.',
      'platformExportObj.'
    ))
    .pipe(plugins.insert.append(moduleCompatibilityFooter))
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest('.'));
});

gulp.task('build:tests', () => {
  const tsProject = plugins.typescript.createProject('tsconfig.json', {
    module: 'commonjs',
    moduleResolution: 'node',
  });
  return gulp.src([
      'shadowsocks_config.spec.ts',
    ])
    .pipe(tsProject())
    .once('error', function () {
      this.once('finish', () => process.exit(1))
    })
    .js
    .pipe(gulp.dest('.'));
});


gulp.task('tslint', () => {
  let errorCount = 0;
  const status = githubCommit.getStatus('TypeScript Code Style');
  return status.report(Statuses.pending)
    .then(() => {
      return gulp.src('shadowsocks_config.ts')
        .pipe(plugins.tslint({
          configuration: 'tslint.json',
          formatter: 'prose'
        }))
        .pipe(map((file, done) => {
          errorCount += file.tslint.errorCount;
          done(null, file);
        }))
        .pipe(plugins.tslint.report({
          emitError: false
        }));
    })
    .then(() => {
      const hasErrors = (errorCount > 0);
      const state = hasErrors ? Statuses.failure : Statuses.success;
      const description = hasErrors ? `failed with ${errorCount} errors` : '';
      return status.report(state, description);
    });

});


gulp.task('default', ['build:lib', 'build:tests']);

