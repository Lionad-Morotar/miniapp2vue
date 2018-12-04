const fs = require('fs')
const path = require('path')

import aliConfig from './ali/appJSON.map'
import swanConfig from './swan/appJSON.map'
import wechatConfig from './wechat/appJSON.map'

const options = {
    aliConfig,
    swanConfig,
    wechatConfig,
}

const chore = (appJSON, targetJSON, key, source, target) => {
    let unwashJSON = appJSON[key] || [],
        sourceConfig = source[key] || [],
        targetConfig = target[key] || [],
        sourceConfigMap = sourceConfig.reduce((a, x) => { a[x.key] = x.des; return a }, {}),
        targetConfigMap = targetConfig.reduce((a, x) => { a[x.des] = x.key; return a }, {})
    
    for (let unwashKey in unwashJSON) {
        let configID = sourceConfigMap[unwashKey],
            washedKey = targetConfigMap[configID]
        if (washedKey) {
            targetJSON[key][washedKey] = unwashJSON[unwashKey]
        } else {
            targetJSON[key][unwashKey] = unwashJSON[unwashKey]
        }
    }
}

const ConfigHandle = {

    convert (appJSONFile, rawConfig) {
        let { from, to } = rawConfig,
            sourceConfig = options[`${from}Config`],
            targetConfig = options[`${to}Config`]
        let content = fs.readFileSync(appJSONFile, 'utf8')
        let appJSON = null,
            targetJSON = {}

        try {
            appJSON = JSON.parse(content)
        } catch (err) {
            throw new Error('appJSONFile can\'t be parsed, pls check it : ' + appJSONFile)
        }

        if (appJSON) {
            for (let key in appJSON) {
                targetJSON[key] = {}
                
                // 存在 appJSON.map.js 中的键,
                // 代表可能存在平台差异, 需要进行处理,
                // 否则直接写入 targetJSON
                if (sourceConfig[key]) {
                    chore(appJSON, targetJSON, key, sourceConfig, targetConfig)
                } else {
                    targetJSON[key] = appJSON[key]
                }

            }
            // console.log(targetJSON)
            ConfigHandle.writeToFile(targetJSON, appJSONFile, rawConfig)
        }
    },

    writeToFile (json, rawFilePath, rawConfig) {
        let writePath = path.join(__dirname, rawConfig.writePath || './')
        let writeFileName = rawFilePath.match(/([^\\|\/]+)\..*$/)[1]
        let writeFolder = writePath + rawConfig.from + '-' + rawConfig.to

        if (!fs.existsSync(writeFolder)) {
            fs.mkdirSync(writeFolder)
        }
        fs.writeFileSync(
            writeFolder + path.sep + writeFileName+'.json', 
            JSON.stringify(json, null, '    ')
        )
    },

}

export default ConfigHandle