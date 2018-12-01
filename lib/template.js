const fs = require('fs')
// import { makeMap } from '../util/index'

import { createCompiler } from './template-compiler'

import swan2vueOptions from "./swan2vue/index"

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
            if (compiled.errors.length) {
                throw new Error(compiled.errors[0])
            }
            return template.compileAST(compiled.ast)
        })
    },
    compile (content, rawConfig) {

        let compileOptions = config[`${rawConfig.plat}2vueOptions`].compileOptions
        let compile = createCompiler(compileOptions).compile
        let ast = compile(content, compileOptions)

        console.log(ast)

        return {
            errors: [],
            ast,
        }
    },
    compileAST (ast) {
        let astHandle = config[`${rawConfig.plat}2vueOptions`].compileASTHandle
        let tpl = astHandle.compile(ast)

        console.log(tpl)

        return tpl
    },
}

export default template
