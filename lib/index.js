import { extend } from "../util/index"

import extract from "./extract"

import { default as template } from './template'

const fileHandle = {
    extract,
    template
}

/** Compiler
 *
 * @var { Array, String } folder 
 * @var { String } config.plat required [ 'swan', 'wx', 'ali' ]
 * @var { String } config.type [ 'template', 'javascript', 'all' ]
 */
function convert(folder, config) {

    /** var starndards */

    config = extend({ type: "all" }, config)

    let folders = folder instanceof Array ? folder : [folder]
    let res = []

    /** logic */

    // let compilerName = `${config.plat}2vue`,
    let compilerHandle = config.type
    let handle = fileHandle.extract(folders, config)
        handle.forEach(item => {
            res.push(
                fileHandle[compilerHandle].convert(item, config)
            )
        })

    /** return val */

    return res
}

export default {
    convert
}