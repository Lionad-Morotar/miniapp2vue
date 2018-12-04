'use strict';

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 */
function makeMap (
    str,
    splitChar,
    expectsLowerCase,
) {
    var map = Object.create(null);
    var list = str.split(splitChar || ',');
    for (var i = 0; i < list.length; i++) {
        let [key, val] = list[i].split(':');
        map[key] = val || true;
    }
    return expectsLowerCase
        ? function (val) { return map[val.toLowerCase()] }
        : function (val) { return map[val] }
}

/**
 * @file Origin Code from VueJS modified by Lionad tangnad@qq.com
 */

// 一维的不可嵌套的标签
var isUnaryTag = makeMap(
    'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
    'link,meta,param,source,track,wbr'
);

// Elements that you can, intentionally, leave open
// (and which close themselves)
// 可以显式自关闭的标签
var canBeLeftOpenTag = makeMap(
    'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'
);

// HTML5 tags 
// @see https://html.spec.whatwg.org/multipage/indices.html#elements-3
// Phrasing Content 
// @see https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
// (包含)短语内容的节点
// 意味着这些节点中可能存在 文本内容 等不需要进行解析的 HTML 内容
var isNonPhrasingTag = makeMap(
    'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
    'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
    'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
    'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
    'title,tr,track'
);

// Special Elements (can contain anything)
// 可以包含任何内容的节点(不被htmlParser继续遍历解析)
var isPlainTextElement = makeMap('script,style,textarea', true);

// 可以包含'\n'的节点
var isIgnoreNewlineTag = makeMap('pre,textarea', true);

/** 部分浏览器会将节点内属性(值)内的一些字符等转义(见 decodingMap)
 * 
 */
var inBrowser = typeof window !== 'undefined';
// #3663: IE encodes newlines inside attribute values while other browsers don't
var shouldDecodeNewlines = inBrowser ? getShouldDecode(false) : false;
// #6828: chrome encodes content in a[href]
var shouldDecodeNewlinesForHref = inBrowser ? getShouldDecode(true) : false;
// check whether current browser encodes a char inside attribute values
var div;
function getShouldDecode (href) {
    div = div || document.createElement('div');
    div.innerHTML = href ? "<a href=\"\n\"/>" : "<div a=\"\n\"/>";
    return div.innerHTML.indexOf('&#10;') > 0
}

/**
 * @file origin from VueJS
 */

// Browser environment sniffing
var inBrowser$1 = typeof window !== 'undefined';
var inWeex = typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform;
var weexPlatform = inWeex && WXEnvironment.platform.toLowerCase();
var UA = inBrowser$1 && window.navigator.userAgent.toLowerCase();
var isIE = UA && /msie|trident/.test(UA);
var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
var isEdge = UA && UA.indexOf('edge/') > 0;
var isAndroid = (UA && UA.indexOf('android') > 0) || (weexPlatform === 'android');
var isIOS = (UA && /iphone|ipad|ipod|ios/.test(UA)) || (weexPlatform === 'ios');
var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;

var isUnaryTag$1 = makeMap(
    'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
    'link,meta,param,source,track,wbr'
);

var canBeLeftOpenTag$1 = makeMap(
    'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'
);

var isHTMLTag = makeMap(
    'html,body,base,head,link,meta,style,title,' +
    'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
    'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
    'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
    's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
    'embed,object,param,source,canvas,script,noscript,del,ins,' +
    'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
    'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
    'output,progress,select,textarea,' +
    'details,dialog,menu,menuitem,summary,' +
    'content,element,shadow,template,blockquote,iframe,tfoot'
);
var isSVG = makeMap(
    'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
    'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
    'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
    true
);

const fs = require('fs');
const path = require('path');

const fs$1 = require('fs');
const path$1 = require('path');
const postcss = require('postcss');

const config$2 = {
    window: [
        {
            key: 'defaultTitle',
            des: '导航栏标题文字内容',
        },
        {
            key: 'titleBarColor',
            des: '导航栏背景颜色',
        },
        {
            key: 'pullRefresh',
            des: '是否开启当前页面的下拉刷新',
        },
    ]
};

const config$3 = {
    window: [
        {
            key: 'navigationBarTitleText',
            des: '导航栏标题文字内容',
        },
        {
            key: 'navigationBarBackgroundColor',
            des: '导航栏背景颜色',
        },
        {
            key: 'navigationBarTextStyle',
            des: '导航栏标题颜色',
        },
        {
            key: 'navigationStyle',
            des: '导航栏样式',
        },
        {
            key: 'backgroundColor',
            des: '窗口的背景色',
        },
        {
            key: 'backgroundTextStyle',
            des: '下拉 loading 的样式',
        },
        {
            key: 'enablePullDownRefresh',
            des: '是否开启当前页面的下拉刷新',
        },
        {
            key: 'onReachBottomDistance',
            des: '页面上拉触底事件触发时距页面底部距离',
        },
    ]
};

const config$4 = {
    window: [
        {
            key: 'navigationBarTitleText',
            des: '导航栏标题文字内容',
        },
        {
            key: 'navigationBarBackgroundColor',
            des: '导航栏背景颜色',
        },
        {
            key: 'navigationBarTextStyle',
            des: '导航栏标题颜色',
        },
        {
            key: 'navigationStyle',
            des: '导航栏样式',
        },
        {
            key: 'backgroundColor',
            des: '窗口的背景色',
        },
        {
            key: 'backgroundTextStyle',
            des: '下拉 loading 的样式',
        },
        {
            key: 'backgroundColorTop',
            des: '顶部窗口的背景色',
        },
        {
            key: 'backgroundColorBottom',
            des: '底部窗口的背景色',
        },
        {
            key: 'enablePullDownRefresh',
            des: '是否开启当前页面的下拉刷新',
        },
        {
            key: 'onReachBottomDistance',
            des: '页面上拉触底事件触发时距页面底部距离',
        },
        {
            key: 'pageOrientation',
            des: '屏幕旋转设置',
        },
    ]
};

const fs$2 = require('fs');
const path$2 = require('path');

const options = {
    aliConfig: config$2,
    swanConfig: config$3,
    wechatConfig: config$4,
};

const chore = (appJSON, targetJSON, key, source, target) => {
    let unwashJSON = appJSON[key] || [],
        sourceConfig = source[key] || [],
        targetConfig = target[key] || [],
        sourceConfigMap = sourceConfig.reduce((a, x) => { a[x.key] = x.des; return a }, {}),
        targetConfigMap = targetConfig.reduce((a, x) => { a[x.des] = x.key; return a }, {});
    
    for (let unwashKey in unwashJSON) {
        let configID = sourceConfigMap[unwashKey],
            washedKey = targetConfigMap[configID];
        if (washedKey) {
            targetJSON[key][washedKey] = unwashJSON[unwashKey];
        } else {
            targetJSON[key][unwashKey] = unwashJSON[unwashKey];
        }
    }
};

const ConfigHandle = {

    convert (appJSONFile, rawConfig) {
        let { from, to } = rawConfig,
            sourceConfig = options[`${from}Config`],
            targetConfig = options[`${to}Config`];
        let content = fs$2.readFileSync(appJSONFile, 'utf8');
        let appJSON = null,
            targetJSON = {};

        try {
            appJSON = JSON.parse(content);
        } catch (err) {
            throw new Error('appJSONFile can\'t be parsed, pls check it : ' + appJSONFile)
        }

        if (appJSON) {
            for (let key in appJSON) {
                targetJSON[key] = {};
                
                // 存在 appJSON.map.js 中的键,
                // 代表可能存在平台差异, 需要进行处理,
                // 否则直接写入 targetJSON
                if (sourceConfig[key]) {
                    chore(appJSON, targetJSON, key, sourceConfig, targetConfig);
                } else {
                    targetJSON[key] = appJSON[key];
                }

            }
            // console.log(targetJSON)
            ConfigHandle.writeToFile(targetJSON, appJSONFile, rawConfig);
        }
    },

    writeToFile (json, rawFilePath, rawConfig) {
        let writePath = path$2.join(__dirname, rawConfig.writePath || './');
        let writeFileName = rawFilePath.match(/([^\\|\/]+)\..*$/)[1];
        let writeFolder = writePath + rawConfig.from + '-' + rawConfig.to;

        if (!fs$2.existsSync(writeFolder)) {
            fs$2.mkdirSync(writeFolder);
        }
        fs$2.writeFileSync(
            writeFolder + path$2.sep + writeFileName+'.json', 
            JSON.stringify(json, null, '    ')
        );
    },

};

const path$3 = require('path');

/** 使用 swan 模板Page文件测试 compiler */

let unsolvedFolder = path$3.resolve(__dirname, '../src/swan/swan-template');

// Compiler.convert(unsolvedFolder, {
//     plat: 'swan',
//     type: ['template', 'style'],
// })

/** 测试小程序appJSON互相转换 */

let wechatConfigFile = path$3.resolve(__dirname, '../src/wechat/app.json');

ConfigHandle.convert(wechatConfigFile, {
    from: 'wechat',
    to: 'ali'
});
