/**
 * Created by elyde on 12/13/2016.
 */

'use strict';

const fs = require('fs'),
    path = require('path'),
    crypto = require('crypto'),
    packageJson = require('./package'),
    gulpConfig = require('./gulpfileConfig'),

    /** Gulp Modules (or modules used by gulp) **/
    gulp =          require('gulp'),
    eslint =        require('gulp-eslint'),
    concat =        require('gulp-concat'),

    header =        require('gulp-header'),
    mocha =         require('gulp-mocha'),
    uglify =        require('gulp-uglify'),
    fncallback =    require('gulp-fncallback'),
    jsdoc =         require('gulp-jsdoc3'),
    gulpRollup =    require('gulp-better-rollup'),
    lazyPipe =      require('lazypipe'),
    gulpBabel =     require('gulp-babel'),

    // Rollup plugins
    rollup = require('rollup'),
    rollupBabel = require('rollup-plugin-babel'),
    rollupResolve = require('rollup-plugin-node-resolve'),

    /** Util Modules **/
    chalk = require('chalk'),
    del = require('del'),

    /** Paths **/
    {
        cjsBuildPath, amdBuildPath,
        umdBuildPath, iifeBuildPath,
        buildPathRoot, markdownFragsPath
    } = gulpConfig.paths,

    buildPath = (...tails) => path.join.call(path, buildPathRoot, ...tails),

    iifeMinFileName = 'fjl.errorThrowing.min.js',
    iifeFileName = 'fjl.errorThrowing.js',
    iifeModuleName = 'fjl.errorThrowing',
    srcsGlob = './src/**/*.js',

    VersionNumberReadStream = require('./node-scripts/VersionNumberReadStream'),

    yargs = require('yargs'),

    argv = yargs()
        .default('dev', false)
        .default('skipLint', false)
        .alias('skip-lint', 'skipLint')
        .argv,

    {skipLint} = argv,

    /** Lazy Pipes **/
    eslintPipe = lazyPipe()
        .pipe(eslint)
        .pipe(eslint.format)
        .pipe(eslint.failOnError),

    // Log func
    log = console.log.bind(console),

    deleteFilePaths = pathsToDelete =>
        del(pathsToDelete)
            .then(deletedPaths => {
                if (deletedPaths.length) {
                    log(chalk.dim('\nThe following paths have been deleted: \n - ' + deletedPaths.join('\n - ') + '\n'));
                    return;
                }
                log(chalk.dim(' - No paths to clean.') + '\n', '--mandatory');
            })
            .catch(log)
    ;

gulp.task('member-list-md', function () {
    let outputDir = './markdown-fragments/generated',
        filePath = outputDir + '/member-list.md';
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    fs.writeFileSync(filePath, '');
    return (new ModuleMemberReadStream(
        require('./dist/cjs/fjl.errorThrowing'), 'fjl.errorThrowing', markdownFragsPath + '/member-list'
    ))
        .pipe(fs.createWriteStream(filePath));
});

gulp.task('member-list-md-content', ['member-list-md'], function () {
    return gulp.src(markdownFragsPath + '/member-list/*.md')
        .pipe(concat(markdownFragsPath + '/generated/member-list-content.md'))
        .pipe(gulp.dest('./'));
});

gulp.task('version', () =>
    (new VersionNumberReadStream())
        .pipe(fs.createWriteStream('./src/generated/version.js')));

gulp.task('clean', () => {
    let pathsToDelete = [cjsBuildPath, amdBuildPath, umdBuildPath, iifeBuildPath]
        .map(partialPath => buildPath(partialPath, '**', '*.js'));
    return deleteFilePaths(pathsToDelete);
});

gulp.task('eslint', () => gulp.src(['./src/**/*.js', '!node_modules/**']).pipe(eslintPipe()));

gulp.task('umd', ['eslint'], () =>
    gulp.src(srcsGlob)
        .pipe(gulpBabel(gulpConfig.buildUmdOptions.babel))
        .pipe(gulp.dest(buildPath(umdBuildPath))));

gulp.task('amd', ['eslint'], () =>
    gulp.src(srcsGlob)
        .pipe(gulpBabel(gulpConfig.buildAmdOptions.babel))
        .pipe(gulp.dest(buildPath(amdBuildPath))));

gulp.task('cjs', ['eslint'], () =>
    gulp.src(srcsGlob)
        .pipe(gulpBabel(gulpConfig.buildCjsOptions.babel))
        .pipe(gulp.dest(buildPath(cjsBuildPath))));

gulp.task('iife', ['eslint', 'version'], () =>
    rollup.rollup({
        input: './src/fjl.errorThrowing.js',
        plugins: [
            rollupResolve(),
            rollupBabel({
                babelrc: false,
                presets: [
                    [
                        'es2015',
                        {
                            modules: false
                        }
                    ]
                ],
                plugins: [
                    'external-helpers'
                ],
                exclude: 'node_modules/**' // only transpile our source code
            })
        ],
        external: ['fjl'],
    })
    .then(bundle => bundle.write({
        file: buildPath(iifeBuildPath, iifeFileName),
        format: 'iife',
        name: iifeModuleName,
        globals: {fjl: 'fjl'},
        // dest: buildPath(iifeBuildPath, iifeFileName),
        sourcemap: true
    })));

gulp.task('es6-module', ['eslint', 'version'], () =>
    gulp.src('./src/fjl.errorThrowing.js')
        .pipe(gulpRollup({external: ['fjl']}, {
            moduleName: iifeModuleName,
            format: 'es',
        }))
        .pipe(concat(buildPath('es6-module', iifeFileName)))
        .pipe(gulp.dest('./')));

gulp.task('uglify', ['iife'], () => {
    const data = {};
    return gulp.src(buildPath(iifeBuildPath, iifeFileName))
        .pipe(concat(buildPath(iifeBuildPath, iifeMinFileName)))
        .pipe(fncallback((file, enc, cb) => {
            let hasher = crypto.createHash('md5');
            hasher.update(file.contents.toString(enc));
            data.fileHash = hasher.digest('hex');
            cb();
        }))
        .pipe(uglify(gulpConfig.uglifyOptions))
        .pipe(header('/**! ' + iifeFileName + ' <%= version %> | License: <%= license %> | ' +
            'md5checksum: <%= fileHash %> | Built-on: <%= (new Date()) %> **/', Object.assign(data, packageJson)))
        .pipe(gulp.dest('./'));
});

gulp.task('build-js', ['version', 'uglify', 'cjs', 'amd', 'umd', 'es6-module']);

gulp.task('jsdoc',/* ['readme'],*/ () =>
    deleteFilePaths(['./docs/**/*'])
        .then(_ =>
            gulp.src(['README.md', './src/**/*.js'], {read: false})
                .pipe(jsdoc({
                    opts: {
                        'template': 'templates/default',  // same as -t templates/default
                        'encoding': 'utf8',               // same as -e utf8
                        'destination': './docs/',       // same as -d ./out/
                        'recurse': true
                    }
                }))
        )
);

gulp.task('build-docs', ['jsdoc']);

gulp.task('readme', [
    'member-list-md',
    'member-list-md-content'
], () => gulp.src(gulpConfig.readme)
        .pipe(concat('README.md'))
        .pipe(gulp.dest('./')));

gulp.task('build', ['build-js']);

gulp.task('tests', ['eslint'], () =>
    gulp.src(gulpConfig.tests.srcs)
        .pipe(gulpBabel(gulpConfig.tests.babel))
        .pipe(mocha(gulpConfig.tests.mocha)));

gulp.task('watch', ['build'], () =>
    gulp.watch([
        srcsGlob,
        './node_modules/**'
    ], [
        'build-js'
    ]));

gulp.task('default', ['build', 'watch']);
