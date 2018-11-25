import { extend } from "../util/index"

import extract from "./extract"
import swan2vue from "./swan2vue/index"

const COMPILER = {
    swan2vue,
    extract,
}

/** Compiler
 *
 * @var { Array, String } folder 
 * @var { String } config.plat required [ 'swan', 'wx', 'ali' ]
 * @var { String } config.type [ 'template', 'javascript', 'all' ]
 */
function convert(folder, config) {

    /** var starndards */

    let folders = folder instanceof Array ? folder : [folder]
    config = extend(
        {
            type: "all"
        },
        config
    )

    let res = []

    /** logic */

    let compilerName = `${config.plat}2vue`,
        compilerHandle = config.type
    let handle = COMPILER.extract(folders, config)
    handle.forEach(item => {
        res.push(
            COMPILER[compilerName][compilerHandle].convert(item)
        )
    })

    /** return val */

    return res
}

export default {
    convert
}