module.exports = function(grunt) {
   grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      jshint: {
         files: ['test/**/*.js', 'lib/**/*.js', '*.js'],
         options: {
            eqeqeq: false,
            eqnull: true,
            globals: {
               module: true
            }
         }
      }
   });
   
   grunt.loadNpmTasks('grunt-contrib-jshint');
   grunt.loadNpmTasks('grunt-contrib-qunit');

   grunt.registerTask('default', ['jshint']);
};