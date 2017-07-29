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

    // Ĭ�ϱ�ִ�е������б�
    grunt.registerTask('default', ['watch']); //Ĭ�ϼ������Ƿ��޸�
};