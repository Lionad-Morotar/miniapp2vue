const fs = require('fs')
// import { makeMap } from '../util/index'

import { createCompiler } from './template-compiler'

import { swan2vueOptions } from "./swan2vue/index"
const config = {
    swan2vueOptions,
}

// const isBuiltInTag = makeMap('slot,component')
// const isReservedAttribute = makeMap('key,ref,slot,slot-scope,is')

let template = {
    convert (paths, rawConfig) {
        return paths.map(path => {
            let content = fs.readFileSync(path, 'utf8')
            let compiled = template.compile(content, rawConfig)
            // if (compiled.errors.length) {
            //     throw new Error(compiled.errors[0])
            // }
            // return template.compileAST(compiled.ast)
            return compiled
        })
    },
    compile (content, rawConfig) {

        let compileOptions = config[`${rawConfig.plat}2vueOptions`]
        let compile = createCompiler(compileOptions).compile
        let ast = compile(content, compileOptions)

        return {
            errors: [],
            ast: ast,
        }
    },
    compileAST () {
        return []
    }
}

export default template
