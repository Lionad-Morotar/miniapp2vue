'use strict';

/**
 * Check if val is a valid array index.
 */

/**
 * Mix properties into target object.
 */
function extend(to, _from) {
    for (var key in _from) {
        to[key] = _from[key];
    }
    return to;
}

function extract(folders, config) {
    const fixMap = {
        swan: {
            templateFile: '.swan',
            styleFile: '.css',
            logicFile: '.js',
            configFile: '.json',
        },
    };
    const typeMap = {
        all: ['template', 'style', 'logic', 'config'],
        config: ['config'],
        template: ['template'],
        style: ['style'],
        logic: ['logic'],
    };
    let plat = config.plat;
    let type = config.type,
        fileType = typeMap[type];
    let files = [];

    folders.forEach(folder => {
        let afterFix = fixMap[plat];
        console.log('folder', folder);
        let fileName = folder.replace(/\\/g, '/').replace(/^.*\/([^\/]*)$/, '$1'),
            fileNamePrefix = `${folder}/${fileName}`;
        let templateFile = `${fileNamePrefix}${afterFix['templateFile']}`,
            styleFile = `${fileNamePrefix}${afterFix['styleFile']}`,
            logicFile = `${fileNamePrefix}${afterFix['logicFile']}`,
            configFile = `${fileNamePrefix}${afterFix['configFile']}`;
        files.push({
            templateFile,
            styleFile,
            logicFile,
            configFile,
        });
    });
    // console.log(files)

    return files.map(file => {
        return fileType.map(type => file[`${type}File`])
    })
}

const fs = require('fs');

let template = {
    convert(paths) {
        return paths.map(path => {
            console.log(path);
            let content = fs.readFileSync(path, 'utf8');
            let compiled = template.compile(content);
            if (compiled.errors.length) {
                throw new Error(compiled.errors[0])
            }
            return template.compileAST(compiled.ast)
        })
    },
    compile(content) {
        console.log(content);
        return {
            errors: [],
            ast: []
        }
    },
    compileAST() {
        return []
    }
};

var template$1 = {
    convert: template.convert,
};

var swan2vue = {
    template: template$1
};

const COMPILER = {
    swan2vue,
    handle(folders, config) {
        // console.log('asdfasdf ', folders)
        return extract(folders, config)
    }
};

/** Compiler ç¼è¯å½æ°
 *
 * @var folder { Array, String } åä¸ªé¡µé¢æä»¶å¤¹
 * @var config.plat { String } required [ 'swan', 'wx', 'ali' ] è¢«ç¼è¯çå¹³å°
 * @var config.type { String } [ 'template', 'javascript', 'all' ] ç¼è¯ç±»å
 */
function convert(folder, config) {
    /** default var */

    let folders = folder instanceof Array ? folder : [folder];
    config = extend(
        {
            type: "all"
        },
        config
    );

    let res = [];

    /** logic */

    let compilerName = `${config.plat}2vue`,
        compilerHandle = config.type;
    let handle = COMPILER.handle(folders, config);
    handle.forEach(item => {
        res.push(
            COMPILER[compilerName][compilerHandle].convert(item)
        );
    });

    /** return val */

    return res
}

var Compiler = {
    convert
};

const path = require('path');

var unsolvedFolder = path.resolve(__dirname, '../src/swan/swan-template');
// console.log(unsolvedFolder)

var vuetpl = Compiler.convert(unsolvedFolder, {
    plat: 'swan',
    type: 'template',
});

console.log('RESULT:', vuetpl);
