const path = require('path')

import Compiler from '../lib/index'
import ConfigHandle from '../lib/ConfigHandle/index'

/** 使用 swan 模板Page文件测试 compiler */

let unsolvedFolder = path.resolve(__dirname, '../src/swan/swan-template')

// Compiler.convert(unsolvedFolder, {
//     plat: 'swan',
//     type: ['template', 'style'],
// })

/** 测试小程序appJSON互相转换 */

let wechatConfigFile = path.resolve(__dirname, '../src/wechat/app.json')

ConfigHandle.convert(wechatConfigFile, {
    from: 'wechat',
    to: 'ali'
})