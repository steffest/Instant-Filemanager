module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            app: {
                options: {
                    separator: ';'
                },
                src: [
                    '_script/app/enum.js',
                    '_script/app/app.js',
                    '_script/app/datastore.js',
                    '_script/app/dialog.js',
                    '_script/app/editor.js',
                    '_script/app/filesystem.js',
                    '_script/app/formbuilder.js',
                    '_script/app/media.js',
                    '_script/app/template.js',
                    '_script/app/ui.js',
                    '_script/app/ui_dragdrop.js',
                    '_script/app/upload.js'
                ],
                dest: '_script/app.js'
            },
            boilerplate: {
                options: {
                    separator: ';'
                },
                src: [
                    '_script/boilerplate/util.js',
                    '_script/boilerplate/touch.js',
                    '_script/boilerplate/jquery.sortable.js',
                    '_script/boilerplate/polyfill/array_inludes.js',
                    '_script/boilerplate/blueimp/jquery.iframe-transport.js',
                    '_script/boilerplate/blueimp/jquery.ui.widget.js',
                    '_script/boilerplate/blueimp/jquery.fileupload.js',
                    '_script/boilerplate/moment.min.js',
                    '_script/boilerplate/pickaday.js',
                    '_script/boilerplate/timepicker/lib/bootstrap-datepicker.js',
                    '_script/boilerplate/timepicker/jquery.timepicker.min.js'
                ],
                dest: '_script/boilerplate.js'
            }
        },
        uglify: {
            options: {
                mangle: true,
                compress: {
                    sequences     : true,  // join consecutive statemets with the “comma operator”
                    properties    : true,  // optimize property access: a["foo"] → a.foo
                    dead_code     : true,  // discard unreachable code
                    drop_console  : true,
                    drop_debugger : true,  // discard “debugger” statements
                    unsafe        : false, // some unsafe optimizations (see below)
                    conditionals  : true,  // optimize if-s and conditional expressions
                    comparisons   : true,  // optimize comparisons
                    evaluate      : true,  // evaluate constant expressions
                    booleans      : true,  // optimize boolean expressions
                    loops         : true,  // optimize loops
                    unused        : true,  // drop unused variables/functions
                    hoist_funs    : true,  // hoist function declarations
                    hoist_vars    : false, // hoist variable declarations
                    if_return     : true,  // optimize if-s followed by return/continue
                    join_vars     : true,  // join var declarations
                    cascade       : true,  // try to cascade `right` into `left` in sequences
                    side_effects  : true,  // drop side-effect-free statements
                    warnings      : true,  // warn about potentially dangerous optimizations/code
                    global_defs   : {},
                    pure_getters  : true
                },
                beautify: false
            },
            my_target: {
                files: {
                    '_script/app-min.js': ['_script/app/*.js','_script/app/**/*.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');

    // Default task(s).
    grunt.registerTask('default', ['build']);
    grunt.registerTask('build', ['concat:app','concat:boilerplate']);
    grunt.registerTask('js', ['uglify']);

};