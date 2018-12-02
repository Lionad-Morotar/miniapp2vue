const fs = require('fs')
const path = require('path')
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
            let tpl = template.compileAST(compiled.ast, rawConfig)
            
            process.env.NODE_ENV === 'development' &&
                template.writeTemplateToFIle(tpl, path, rawConfig)

            return tpl
        })
    },
    compile (content, rawConfig) {

        let compileOptions = config[`${rawConfig.plat}2vueOptions`].compileOptions
        let compile = createCompiler(compileOptions).compile
        let ast = compile(content, compileOptions)

        return {
            errors: [],
            ast,
        }
    },
    compileAST (ast, rawConfig) {
        let astHandle = config[`${rawConfig.plat}2vueOptions`].compileASTHandle
        let tpl = astHandle.compile(ast)

        return tpl
    },
    writeTemplateToFIle (tpl, rawFilePath, rawConfig) {
        let writePath = path.join(__dirname, rawConfig.writePath || './')
        console.log(rawFilePath, writePath)
        let writeFileName = rawFilePath.match(/([^\\|\/]+)\..*$/)[1]
        fs.writeFileSync(writePath + writeFileName+'.html', tpl)
    },
}

export default template
