const fs = require('fs')
const path = require('path')
const postcss = require('postcss')

import swan2vueOptions from "./swan2vue/index"

const config = {
    swan2vueOptions,
}

let style = {
    convert (path, rawConfig) {
        return new Promise((resolve, reject) => {
            let content = fs.readFileSync(path, 'utf8')
    
            postcss(swan2vueOptions.postcssPlugins)
                .process(content, { from: undefined, to: undefined })
                .then(compiled => {
                    // console.log(compiled)
    
                    process.env.NODE_ENV === 'development' &&
                        style.writeStyleToFIle(compiled.css, path, rawConfig)
    
                    resolve(compiled.css)
                })
        })
    },
    writeStyleToFIle (tpl, rawFilePath, rawConfig) {
        let writePath = path.join(__dirname, rawConfig.writePath || './')
        let writeFileName = rawFilePath.match(/([^\\|\/]+)\..*$/)[1]

        fs.mkdir(writePath + writeFileName, () => {})
        fs.writeFileSync(writePath + writeFileName + path.sep + writeFileName+'.css', tpl)
    },
}

export default style
