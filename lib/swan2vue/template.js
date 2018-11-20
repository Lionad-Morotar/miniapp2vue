const fs = require('fs')

let template = {
    convert(paths) {
        return paths.map(path => {
            let content = fs.readFileSync(path, 'utf8')
            let compiled = template.compile(content)
            if (compiled.errors.length) {
                throw new Error(compiled.errors[0])
            }
            return template.compileAST(compiled.ast)
        })
    },
    compile(content) {
        console.log(content)
        return {
            errors: [],
            ast: []
        }
    },
    compileAST() {
        return []
    }
}

export default {
    convert: template.convert,
}
