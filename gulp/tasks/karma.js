var gulp = require('gulp'),
	karma = require('gulp-karma'),
	paths = require('../paths');

gulp.task('karma', ['assets'], function () {
	return gulp.src([
		paths.components.dest + '/main.js',
		paths.scripts.front.dest + '/main.js',
		paths.scripts.back.dest + '/main.js',
		// qunit helpers must not be included in general components package
		'public/components/ember-qunit/dist/globals/main.js',
		'test/helpers/**/*.js',
		'test/specs/**/*.js',
	])
	.pipe(karma({
		configFile: 'test/karma.conf.js',
		action: gulp.env.action === 'watch' ? gulp.env.action : 'run'
	}))
	.on('error', function (error) {
		throw error;
	});
});
