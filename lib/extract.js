const fixMap = {
    swan: {
        template: '.swan',
        style: '.css',
        logic: '.js',
        config: '.json',
    },
}
const typeMap = {
    all: ['template', 'style', 'logic', 'config'],
    config: ['config'],
    template: ['template'],
    style: ['style'],
    logic: ['logic'],
}

function extract(folders, config) {
    let plat = config.plat
    let type = config.type,
        fileType = type instanceof Array ?
            type.reduce((a, c) => { return a.concat(typeMap[c]) }, []) :
            typeMap[type]
    // console.log(fileType)
    let files = []

    folders.forEach(folder => {
        let afterFix = fixMap[plat]
        // console.log('folder', folder)
        let fileName = folder.replace(/\\/g, '/').replace(/^.*\/([^\/]*)$/, '$1'),
            fileNamePrefix = `${folder}/${fileName}`
        let templateFile = `${fileNamePrefix}${afterFix['template']}`,
            styleFile = `${fileNamePrefix}${afterFix['style']}`,
            logicFile = `${fileNamePrefix}${afterFix['logic']}`,
            configFile = `${fileNamePrefix}${afterFix['config']}`
        files.push({
            templateFile,
            styleFile,
            logicFile,
            configFile,
        })
    })
    // console.log(files)

    return files.map(file => {
        return fileType.map(type => file[`${type}File`])
    })
}
extract.fixMap = fixMap
extract.typeMap = typeMap

export default extract
