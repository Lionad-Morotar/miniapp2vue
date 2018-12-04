import { extend } from "../util/index"

import extract from "./extract"

import { default as template } from './template'
import { default as style } from './style'
import { default as sfc } from './sfc'

const fileHandle = {
    extract,
    template,
    style,
    sfc,
}

/** Compiler
 *
 * @var { Array, String } folder 
 * @var { String } config.plat required [ 'swan', 'wx', 'ali' ]
 * @var { String } config.type [ 'template', 'style', 'javascript', 'all' ]
 */
function convert(folder, config) {

    config = extend({ type: "all" }, config)

    let folders = folder instanceof Array ? folder : [folder]

    /** 遍历每一个页面, 不同的文件后缀采用不同的compiler转换 */

    let pages = fileHandle.extract(folders, config)
        pages.forEach(pageComponent => {
            let pageContent = {},
                done = 0

            function checkCompileSFC (done) {
                done === pageComponent.length &&
                    fileHandle.sfc.compile(pageContent)
                        .then(res => {
                            console.log('done')
                        })
            }

            pageComponent.forEach(file => {
                let suffixMap = extract.fixMap[config.plat],
                    suffixMapRev = {},
                    suffixRe = /\..*$/
                
                for (let key in suffixMap) {
                    suffixMapRev[suffixMap[key]] = key
                }
                let suffix = file.match(suffixRe),
                    compilerHandle = suffixMapRev[suffix]

                fileHandle[compilerHandle]
                    .convert(file, config)
                    .then(res => {
                        pageContent[suffix] = res
                        checkCompileSFC(++done)
                    })
            })
        })
}

export default {
    convert
}