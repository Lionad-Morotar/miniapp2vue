function extract(folders, config) {
    const fixMap = {
        swan: {
            templateFile: '.swan',
            styleFile: '.css',
            logicFile: '.js',
            configFile: '.json',
        },
    }
    const typeMap = {
        all: ['template', 'style', 'logic', 'config'],
        config: ['config'],
        template: ['template'],
        style: ['style'],
        logic: ['logic'],
    }
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
        let templateFile = `${fileNamePrefix}${afterFix['templateFile']}`,
            styleFile = `${fileNamePrefix}${afterFix['styleFile']}`,
            logicFile = `${fileNamePrefix}${afterFix['logicFile']}`,
            configFile = `${fileNamePrefix}${afterFix['configFile']}`
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

export default extract
