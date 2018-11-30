const path = require('path')

import Compiler from '../lib/index'

var unsolvedFolder = path.resolve(__dirname, '../src/swan/swan-template')
// console.log(unsolvedFolder)

Compiler.convert(unsolvedFolder, {
    plat: 'swan',
    type: 'template',
})