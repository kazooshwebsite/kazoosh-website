(function() {
'use strict';

/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    CONF: grunt.file.readJSON('config.json'),
    sass: {
      dist: {
        options: {
          style: 'expanded',
        },
        files: {
          'public_html/css/style.css': 'public_html/sass/style.scss',
        },
      },
    },
    watch: {
      content: {
        files: ['<%= CONF.contentSourceDirectory %>/**'],
        tasks: ['content'],
        options: {
          spawn: false,
        },
      },
      images: {
        files: ['<%= CONF.imagesSourceDirectory %>/**'],
        // Use images watch event for performance issues
        tasks: ['clean:images', 'copy:images'],
        options: {
          spawn: false,
        },
      },
      css: {
        files: ['public_html/sass/*.scss'],
        tasks: ['sass'],
      },
      jshint: {
        files: ['<%= jshint.files %>'],
        tasks: ['jshint'],
      },
    },
    shell: {
      mdToJson: {
        command: function(sourceDirectory, destinationDirectory) {
          var script = 'python script/mdToJson.py ' +
            sourceDirectory + ' ' + destinationDirectory;
          return script;
        },
      },
    },
    clean: {
      images: ['<%= CONF.imagesDestinationDirectory %>'],
    },
    copy: {
      images: {
        cwd: '<%= CONF.imagesSourceDirectory %>',
        src: '**',
        dest: '<%= CONF.imagesDestinationDirectory %>',
        expand: true,
      },
    },
    jshint: {
      files: ['Gruntfile.js', 'public_html/js/**/*.js'],
      options: {
        jshintrc: true,
      },
    },
    jscs: {
      files: {
        src: ['<%= jshint.files %>'],
      },
      options: {
        config: '.jscsrc',
      },
    },
  });

  // Merge local config
  if (grunt.file.exists('config.local.json')) {
    grunt.config.merge({CONF: grunt.file.readJSON('config.local.json')});
  }


  grunt.event.on('watch', function(action, filepath, target) {

    grunt.log.write(
      'watch: action:' + action +
      ', filepath: ' + filepath +
      ', target: ' + target
    );

    // TODO: ony 'deleted' action seems to be working on server
    /*

    If (target === 'images') {
     var pathArray = filepath.split("/");
     var imgFilePath = pathArray.slice(1).join("/");//path without image folder
     imgFilePath = grunt.config.get('CONF.imagesDestinationDirectory') +
      '/'+imgFilePath;

     if (action === 'deleted') {
      grunt.log.write("delete image "+imgFilePath);
      grunt.file.delete(imgFilePath);
     }
     else if(
      action === 'added' ||
      action === 'changed' ||
      action === 'renamed'
    ){
      grunt.log.write("copy image from "+filepath+" to "+imgFilePath);
      grunt.file.copy(filepath, imgFilePath)
     }
    }*/
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jscs');

  grunt.registerTask(
    'content',
    [
      'shell:mdToJson:<%= CONF.contentSourceDirectory %>:' +
      '<%= CONF.contentDestinationDirectory %>',
    ]
  );
  grunt.registerTask('images', ['clean:images', 'copy:images']);
  grunt.registerTask('observe', ['sass', 'content', 'images', 'watch']);
  grunt.registerTask('observe-contents', ['content', 'images', 'watch']);
};
}());