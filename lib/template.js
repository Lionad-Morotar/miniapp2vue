const fs = require('fs')
const path = require('path')

import { createCompiler } from './template-compiler'

import swan2vueOptions from "./swan2vue/index"

const config = {
    swan2vueOptions,
}

let template = {
    convert (path, rawConfig) {
        return new Promise((resolve, reject) => {
            let content = fs.readFileSync(path, 'utf8')
            let compiled = template.compile(content, rawConfig)
            let tpl = template.compileAST(compiled.ast, rawConfig)
            
            process.env.NODE_ENV === 'development' &&
                template.writeTemplateToFIle(tpl, path, rawConfig)
    
            resolve(tpl)
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
        
        fs.mkdir(writePath + writeFileName, () => {})
        fs.writeFileSync(
            writePath + writeFileName + path.sep + writeFileName+'.html', 
            tpl + `
                <script src="./swan-template.js"></script>
                <link rel="stylesheet" href="./swan-template.css" type="text/css" />
            `
        )
    },
}

export default template
