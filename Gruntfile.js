module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jsdoc : {
            dist : {
                src: ['src/js/components/*.js', 'src/js/components/**/*.js'],
                options: {
                    destination: 'doc2',
                    private:false,
                    "templates": {
                        "cleverLinks": false,
                        "monospaceLinks": false
                    }
                }
            }
        },
        watch: {
            scripts: {
                files: ['src/js/components/*.js', 'src/js/components/**/*.js'],
                tasks: ['jsdoc'],
                options: {
                    spawn: false
                }
            }
        }
    });

    grunt.loadNpmTasks("grunt-jsdoc");
    grunt.loadNpmTasks("grunt-contrib-watch");

    // 默认被执行的任务列表。
    grunt.registerTask('default', ['watch']); //默认检查代码是否修改
};