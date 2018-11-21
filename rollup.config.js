export default [{


    watch: {
        include: ['src/**/*', 'lib/**/*', 'util/**/*'],
    },

    input: 'src/index.js',
    output: {
        file: 'build/miniapp2vue.js',
        format: 'cjs'
    },
}]
