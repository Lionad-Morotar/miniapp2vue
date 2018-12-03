'use strict';

var no = function (a, b, c) { return false; };

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

/** 将对象属性(name, value)转化为哈希(name: value)
 * 
 * @param { Array } attrs 
 */
function makeAttrsMap(attrs) {
    var map = {};
    for (var i = 0, l = attrs.length; i < l; i++) {
        map[attrs[i].name] = attrs[i].value;
    }
    return map
}

/**
 * Mix properties into target object.
 */
function extend(to, _from) {
    for (var key in _from) {
        to[key] = _from[key];
    }
    return to;
}

const fixMap = {
    swan: {
        template: '.swan',
        style: '.css',
        logic: '.js',
        config: '.json',
    },
};
const typeMap = {
    all: ['template', 'style', 'logic', 'config'],
    config: ['config'],
    template: ['template'],
    style: ['style'],
    logic: ['logic'],
};

function extract(folders, config) {
    let plat = config.plat;
    let type = config.type,
        fileType = type instanceof Array ?
            type.reduce((a, c) => { return a.concat(typeMap[c]) }, []) :
            typeMap[type];
    // console.log(fileType)
    let files = [];

    folders.forEach(folder => {
        let afterFix = fixMap[plat];
        // console.log('folder', folder)
        let fileName = folder.replace(/\\/g, '/').replace(/^.*\/([^\/]*)$/, '$1'),
            fileNamePrefix = `${folder}/${fileName}`;
        let templateFile = `${fileNamePrefix}${afterFix['template']}`,
            styleFile = `${fileNamePrefix}${afterFix['style']}`,
            logicFile = `${fileNamePrefix}${afterFix['logic']}`,
            configFile = `${fileNamePrefix}${afterFix['config']}`;
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
extract.fixMap = fixMap;
extract.typeMap = typeMap;

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
// #5992
var shouldIgnoreFirstNewline = function (tag, html) { 
    return tag && isIgnoreNewlineTag(tag) && html[0] === '\n'
};

/**
 * Not type-checking this file because it's mostly vendor code.
 */

/*!
 * HTML Parser By John Resig (ejohn.org)
 * Modified by Juriy "kangax" Zaytsev
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 */


// Regular Expressions for parsing tags and attributes
// 获取属性和内容的正则
// --- ` class="page">`.match(attribute)
// --- [" class="page"", "class", "=", "page", undefined, undefined, index: 0, input: " class="page">", groups: undefined]
// ---` class>`.match(attribute)
// --- [" class", "class", undefined, undefined, undefined, undefined, index: 0, input: " class>", groups: undefined]
var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;

// could use https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName
// but for Vue templates we can enforce a simple charset
// 本来可以使用NT-Qualified (Tag) Name
// 但是作为Vue而言, 使用简单的检验规则就可以了
var ncname = '[a-zA-Z_][\\w\\-\\.]*';
// 捕获可能含有命名空间的Tag
var qnameCapture = "((?:" + ncname + "\\:)?" + ncname + ")";

// 标记 Tag 语句开头
var startTagOpen = new RegExp(("^<" + qnameCapture));

// 标记 Tag 语句结尾
var startTagClose = /^\s*(\/?)>/;

// 标记结尾的 Tag
var endTag = new RegExp(("^<\\/" + qnameCapture + "[^>]*>"));

// 匹配 DOCTYPE
var doctype = /^<!DOCTYPE [^>]+>/i;

// #7298: escape - to avoid being pased as HTML comment when inlined in page
var comment = /^<!\--/;
var conditionalComment = /^<!\[/;


// 测试环境下replace的正则参数是否能正常运行
// 用来解决FF下某个BUG
var IS_REGEX_CAPTURING_BROKEN = false;
'x'.replace(/x(.)?/g, function (m, g) {
    IS_REGEX_CAPTURING_BROKEN = g === '';
});

var reCache = {};

var decodingMap = {
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&amp;': '&',
    '&#10;': '\n',
    '&#9;': '\t'
};

// #(2018年11月21日 17点59分) 转码特殊字符
var encodedAttr = /&(?:lt|gt|quot|amp);/g;
var encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#10|#9);/g;
function decodeAttr (value, shouldDecodeNewlines) {
    var re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr;
    return value.replace(re, function (match) { return decodingMap[match]; })
}

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

// VueJS传入的对各种解析情况进行处理的选项
// var baseOptions = {
//     expectHTML: true,
//     modules: modules$1,
//     directives: directives$1,
//     isPreTag: isPreTag,
//     isUnaryTag: isUnaryTag,
//     mustUseProp: mustUseProp,
//     canBeLeftOpenTag: canBeLeftOpenTag,
//     isReservedTag: isReservedTag,
//     getTagNamespace: getTagNamespace,
//     staticKeys: genStaticKeys(modules$1)
// }

/** HTML Parser
 * 
 * @param { String } html 
 * @param { Options } options VueJS传入的对各种解析情况进行处理的选项
 */
function parseHTML(html, options) {
    var stack = [];

    // expectHTML 标记是否要接受 HTML 内容, 如文本内容.
    // 如果为 false 则表示只解析标签, 而对 HTML 内容直接丢弃.
    var expectHTML = options.expectHTML;

    var isUnaryTag$$1 = options.isUnaryTag || false;

    // 可省略闭合标签的节点
    // @see https://www.v2ex.com/t/129355
    // 如下列写法(是符合规范(且被谷歌推荐)的)
    // ```html
    // <ul>
    // <li>Moe
    // <li>Larry
    // <li>Curly
    // </ul>
    // ```
    var canBeLeftOpenTag$$1 = options.canBeLeftOpenTag || false;

    var index = 0;
    var last, lastTag;

    while (html) {
        last = html;

        // Make sure we're not in a plaintext content element like script/style
        // isPlainTextElement 可以包含任何内容的节点(不被htmlParser继续遍历解析)
        // !lastTag 是包含了空标签节点的情况...? `<></>`
        if (!lastTag || !isPlainTextElement(lastTag)) {

            // 匹配文本的结束位置, 只有文本结束了, 才可以开始匹配节点
            var textEnd = html.indexOf('<');
            if (textEnd === 0) {

                // Comment:
                // --- var comment = `<!-- Lionad -->`
                // --- var commentStart = /^<!\--/
                // --- commentStart.test(comment)
                // --- true
                // --- var commentEnd = comment.indexOf('-->')
                // --- comment.substring(4, commentEnd)
                // --- ' Lionad '
                // --- comment.charAt(commentEnd)
                // --- '-'
                if (comment.test(html)) {
                    var commentEnd = html.indexOf('-->');

                    if (commentEnd >= 0) {
                        if (options.shouldKeepComment) {
                            options.comment(html.substring(4, commentEnd));
                        }
                        advance(commentEnd + 3);
                        continue
                    }
                }

                // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
                // 条件注释 如:
                // --- <![if !IE]>
                // --- <link href="non-ie.css" rel="stylesheet">
                // --- <![endif]></link>
                if (conditionalComment.test(html)) {
                    var conditionalEnd = html.indexOf(']>');

                    if (conditionalEnd >= 0) {
                        advance(conditionalEnd + 2);
                        continue
                    }
                }

                // Doctype:
                var doctypeMatch = html.match(doctype);
                if (doctypeMatch) {
                    advance(doctypeMatch[0].length);
                    continue
                }

                // End tag:
                // --- "</input>".match(endTag)
                // --- ["</input>", "input", index: 0, input: "</input>", groups: undefined]
                var endTagMatch = html.match(endTag);
                if (endTagMatch) {
                    var curIndex = index;
                    advance(endTagMatch[0].length);
                    parseEndTag(endTagMatch[1], curIndex, index);
                    continue
                }

                // Start tag:
                // 尝试开始匹配标签,
                // 如果匹配上了(parseStartTag 同时会将属性匹配完毕)
                var startTagMatch = parseStartTag();                
                if (startTagMatch) {

                    // 处理匹配的属性,
                    // (使用 options.start 处理整个开始标签)
                    handleStartTag(startTagMatch);
                    // 

                    if (shouldIgnoreFirstNewline(lastTag, html)) {
                        advance(1);
                    }
                    continue
                }
            }

            var text = (void 0),
                rest = (void 0),
                next = (void 0);

            /**
             *  匹配文本
             */
            if (textEnd >= 0) {
                rest = html.slice(textEnd);
                while (
                !endTag.test(rest) &&
                !startTagOpen.test(rest) &&
                !comment.test(rest) &&
                !conditionalComment.test(rest)
                ) {
                // < in plain text, be forgiving and treat it as text
                next = rest.indexOf('<', 1);
                if (next < 0) {
                    break
                }
                textEnd += next;
                rest = html.slice(textEnd);
                }
                text = html.substring(0, textEnd);
                advance(textEnd);
            }

            // 结束条件
            if (textEnd < 0) {
                text = html;
                html = '';
            }

            // 使用外部传入的 options.char 进行文本节点处理
            if (options.chars && text) {
                options.chars(text);
            }

        } else {

            var endTagLength = 0;
            var stackedTag = lastTag.toLowerCase();
            var reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'));
            
            // 取文本内容到rest$1并使用外部传入的 options.chars 处理文本
            var rest$1 = html.replace(reStackedTag, function (all, text, endTag) {
                endTagLength = endTag.length;
                if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
                    text = text
                        // ...
                        .replace(/<!\--([\s\S]*?)-->/g, '$1') // #7298
                        // ...
                        .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1');
                }
                if (shouldIgnoreFirstNewline(stackedTag, text)) {
                    text = text.slice(1);
                }
                if (options.chars) {
                    options.chars(text);
                }
                return ''
            });

            index += html.length - rest$1.length;
            html = rest$1;

            parseEndTag(stackedTag, index - endTagLength, index);
        }

        // 处理所有节点之外的文本内容, 如 '...</body>something' 中的 'something'
        if (html === last) {
            options.chars && options.chars(html);
            // if ("development" !== 'production' && !stack.length && options.warn) {
            //     options.warn(("Mal-formatted tag at end of template: \"" + html + "\""));
            // }
            break
        }
    }

    // Clean up any remaining tags
    // 清空标签栈
    parseEndTag();

    function advance(n) {
        index += n;
        html = html.substring(n);
    }

    // 尝试开始匹配标签,
    // 如果匹配上了(parseStartTag 同时会将属性匹配完毕)
    function parseStartTag() {

        // --- '<div class="fsdf"></div>'.match(startTagOpen)
        // ["<div", "div", index: 0, input: "<div class="fsdf"></div>", groups: undefined]
        var start = html.match(startTagOpen);

        if (start) {
            var match = {
                // 'div'
                tagName: start[1],
                attrs: [],
                // 当前整个 html 的 index
                start: index 
            };
            advance(start[0].length);

            var end, attr;
            // 只要没到标签结束 (类似`/>`), 则一直匹配属性并推入堆栈
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                advance(attr[0].length);
                match.attrs.push(attr);
                // start[1] === 'checkbox' && 
                //     console.log(attr[0])
            }

            if (end) {
                // 根据有没有匹配到 '/' 判断当前是否是自闭和标签
                match.unarySlash = end[1];
                advance(end[0].length);
                match.end = index;
                return match
            }
        }
    }

    function handleStartTag(match) {
        var tagName = match.tagName;
        var unarySlash = match.unarySlash;

        if (expectHTML) {
            
            /** 两种情况会放弃继续解析 HTML 内容 (在 expectHTML 标记成立的情况下)
             * (如舍弃其中的 文本内容)
             * 1. 如 p,div 等节点, 其中可能包含文本内容
             * 2. 当前节点可省略闭合标签(...?且与上一个标签相同)
             * #(2018年11月21日 18点07分)
             */
            // ...? 为什么 TagP 不属于 NonPhrasingTag ?
            if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
                parseEndTag(lastTag);
            }
            if (canBeLeftOpenTag$$1(tagName) && lastTag === tagName) {
                parseEndTag(tagName);
            }
        }

        // unary(不可嵌套) 指匹配开始标签(<div>)匹配到 '/' 或者该标签是不可嵌套的标签
        var unary = isUnaryTag$$1(tagName) || !!unarySlash;

        var l = match.attrs.length;
        var attrs = new Array(l);
        for (var i = 0; i < l; i++) {
            var args = match.attrs[i];

            // hackish work around FF bug https://bugzilla.mozilla.org/show_bug.cgi?id=369778
            // 解决某个FF浏览器的正则BUG
            if (IS_REGEX_CAPTURING_BROKEN && args[0].indexOf('""') === -1) {
                if (args[3] === '') {
                    delete args[3];
                }
                if (args[4] === '') {
                    delete args[4];
                }
                if (args[5] === '') {
                    delete args[5];
                }
            }

            // 获取该属性的值
            var value = args[3] || args[4] || args[5] || '';

            // #(2018年11月21日 17点59分)
            // 有些浏览器会对属性值内的 '\n' 符号进行 encode
            var shouldDecodeNewlines = tagName === 'a' && args[1] === 'href' ?
                options.shouldDecodeNewlinesForHref :
                options.shouldDecodeNewlines;

            attrs[i] = {
                name: args[1],
                value: decodeAttr(value, shouldDecodeNewlines)
            };
        }

        // 如果当前节点可嵌套, 则推入堆栈, 并记录 lastTag
        // #(2018年11月21日 18点07分) (lastTag 记录了先前节点可嵌套信息)
        if (!unary) {
            stack.push({
                tag: tagName,
                lowerCasedTag: tagName.toLowerCase(),
                attrs: attrs
            });
            lastTag = tagName;
        }

        // 使用传入的 options.start 处理节点(转化为 AST)
        if (options.start) {
            options.start(tagName, attrs, unary, match.start, match.end);
        }
    }

    // 如果不带参数 则会清空标签栈
    function parseEndTag(tagName, start, end) {
        var pos, lowerCasedTagName;
        if (start == null) {
            start = index;
        }
        if (end == null) {
            end = index;
        }

        if (tagName) {
            lowerCasedTagName = tagName.toLowerCase();
        }

        // Find the closest opened tag of the same type
        if (tagName) {
            for (pos = stack.length - 1; pos >= 0; pos--) {
                if (stack[pos].lowerCasedTag === lowerCasedTagName) {
                    break
                }
            }
        } else {
            // If no tag name is provided, clean shop
            pos = 0;
        }

        if (pos >= 0) {
            // Close all the open elements, up the stack
            for (var i = stack.length - 1; i >= pos; i--) {
                if (i > pos || !tagName &&
                    options.warn
                ) {
                    options.warn(
                        ("tag <" + (stack[i].tag) + "> has no matching end tag.")
                    );
                }
                if (options.end) {
                    options.end(stack[i].tag, start, end);
                }
            }

            // Remove the open elements from the stack
            stack.length = pos;
            lastTag = pos && stack[pos - 1].tag;

        } else if (lowerCasedTagName === 'br') {
            if (options.start) {
                options.start(tagName, [], true, start, end);
            }
        } else if (lowerCasedTagName === 'p') {
            if (options.start) {
                options.start(tagName, [], false, start, end);
            }
            if (options.end) {
                options.end(tagName, start, end);
            }
        }
    }
}

/**
 * @file origin from VueJS
 */

function createCompilerCreator(baseCompile) {
    return function createCompiler(baseOptions) {
        function compile(
            template,
            options
        ) {
            var finalOptions = Object.create(baseOptions);
            var errors = [];
            var tips = [];

            var compiled = baseCompile(template, finalOptions);

            compiled.errors = errors;
            compiled.tips = tips;

            return compiled
        }

        return {
            compile: compile,
        }
    }
}

function createASTElement(tag, attrs, parent) {
    return {
        type: 1,
        tag: tag,
        attrsList: attrs,
        attrsMap: makeAttrsMap(attrs),
        parent: parent,
        children: []
    }
}

function parse (template, options) {

    var stack = [];
    var root;
    var currentParent;
    var inPre = false;

    var preserveWhitespace = options.preserveWhitespace !== false;
    var platformIsPreTag = options.isPreTag || no;


    function closeElement(element) {
        
        // element.tag === 'checkbox' &&
        //     console.log(element)

        // check pre state
        if (element.pre) {
            inVPre = false;
        }
        if (platformIsPreTag(element.tag)) {
            inPre = false;
        }
    }

    parseHTML(template, {
        expectHTML: options.expectHTML,
        isUnaryTag: options.isUnaryTag,
        canBeLeftOpenTag: options.canBeLeftOpenTag,
        shouldDecodeNewlines: options.shouldDecodeNewlines,
        shouldDecodeNewlinesForHref: options.shouldDecodeNewlinesForHref,
        shouldKeepComment: options.shouldKeepComment || true,
        start: options.start || function start(tag, attrs, unary) {
            
            var ns = (currentParent && currentParent.ns) || options.getTagNamespace(tag);

            var element = createASTElement(tag, attrs, currentParent);

            // tag === 'checkbox' &&
            //     console.log(tag, attrs, element)

            if (ns) {
                element.ns = ns;
            }

            if (platformIsPreTag(element.tag)) {
                inPre = true;
            }

            // tree management
            if (!root) {
                root = element;
            }

            if (currentParent && !element.forbidden) {
                if (element.elseif || element.else) {
                    processIfConditions(element, currentParent);
                } else if (element.slotScope) { // scoped slot
                    currentParent.plain = false;
                    var name = element.slotTarget || '"default"';
                    (currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element;
                } else {
                    currentParent.children.push(element);
                    element.parent = currentParent;
                }
            }
            if (!unary) {
                currentParent = element;
                stack.push(element);
            } else {
                closeElement(element);
            }
        },

        end: options.end || function end() {
            // remove trailing whitespace
            var element = stack[stack.length - 1];
            var lastNode = element.children[element.children.length - 1];
            if (lastNode && lastNode.type === 3 && lastNode.text === ' ' && !inPre) {
                element.children.pop();
            }
            // pop stack
            stack.length -= 1;
            currentParent = stack[stack.length - 1];
            closeElement(element);
        },

        chars: options.chars || function chars(text) {
            currentParent.children.push({
                type: 2,
                text: text
            });
        },
        comment: options.comment || function comment(text) {
            currentParent.children.push({
                type: 3,
                text: text,
                isComment: true
            });
        }
    });

    return root
}

var createCompiler = createCompilerCreator(function baseCompile(
    template,
    options
) {
    var ast = parse(template.trim(), options);

    // console.log(ast.children)

    return ast
});

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


function getTagNamespace (tag) {
    if (isSVG(tag)) {
        return 'svg'
    }
    if (tag === 'math') {
        return 'math'
    }
}

var isPreTag = function (tag) { return tag === 'pre' };

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
var isReservedTag = function (tag) {
    return isHTMLTag(tag) || isSVG(tag)
};

const baseCompileOptions = {
    expectHTML: true,
    // modules: modules,
    // directives: directives,
    isPreTag: isPreTag,
    isUnaryTag: isUnaryTag$1,
    // mustUseProp: mustUseProp,
    canBeLeftOpenTag: canBeLeftOpenTag$1,
    isReservedTag: isReservedTag,
    getTagNamespace: getTagNamespace,
    shouldKeepComment: true,
    // staticKeys: genStaticKeys(modules),
};

const tagConvertMap = {
    'view': 'div',
    'block': 'template',
    'scroll-view': 'div',
    'swiper': 'swiper',
    'icon': 'i',
    'text': 'span',
    'rich-text': 'iframe-indoc',
    'progress': 'progress',
    'button': 'button',
    'checkbox': 'input',
    'form': 'form',
    'input': 'input',
    'label': 'label',
    'picker': 'picker',
    'radio': 'radio',
    'switch': 'switch',
    'textarea': 'textarea',
    'audio': 'audio',
    'image': 'img',
    'video': 'video',
    'canvas': 'canvas',
    'web-view': 'iframe',
};
const specialTagHandle = {
    checkbox (node) {
        /** 处理 type checkbox */
        node.attrsList.push({
            name: 'type',
            value: node.tag
        });
        node.attrsMap.type = node.tag;
        /** 处理 checked 属性 */
        if (node.attrsMap.checked === 'false') {
            delete node.attrsMap.checked;
            node.attrsList.splice(
                node.attrsList.findIndex(attr => attr.name === 'checked'),
                1
            );
        }
    }
};
const isWhiteTag = (tagName) => {
    return tagConvertMap[tagName]
};

const compileOptions = {
    expectHTML: baseCompileOptions.expectHTML,
    isUnaryTag: baseCompileOptions.isUnaryTag,
    canBeLeftOpenTag: baseCompileOptions.canBeLeftOpenTag,
    shouldDecodeNewlines: baseCompileOptions.shouldDecodeNewlines,
    shouldDecodeNewlinesForHref: baseCompileOptions.shouldDecodeNewlinesForHref,
    shouldKeepComment: baseCompileOptions.comments,
    getTagNamespace: baseCompileOptions.getTagNamespace,
};

function compileASTToTemplate (ast) {

    let stack = [];
    let tpl = '';

    process(ast);

    // console.log(tpl)

    return tpl

    /**
     * 處理Tag轉換
     */
    function handleTagConvert (node) {
        if (isWhiteTag(node.tag)) {

            specialTagHandle[node.tag] &&
                specialTagHandle[node.tag](node);

            node.tag = tagConvertMap[node.tag];            
        }
        // console.log(tpl)
    }

    /**
     * 处理属性
     */
    function handleAttributes (node) {
        let attrNameMap = makeMap(
            [
                's-if:v-if',
                's-else:v-else'
            
            ].join(',')
        );
        node.attrsList.map(attr => {
    
            /** handle name */
            let reflexAttrName = attrNameMap(attr.name) || attr.name;
            tpl += ` ${reflexAttrName}`;
    
            /** handle value */
            if (attr.value) {
                let realVal = attr.value;
                tpl += `="${realVal}"`;
            }
        });
        // console.log(tpl)
    }

    /**
     * 根据是否是自闭合标签结束开始标签
     */
    function handleStarTagEnd (node) {
        tpl += node.unary ? '/>' : '>'
        ;!node.unary && stack.push({
            tag: node.tag
        });
    }

    /** MAIN
     *  处理stack
     */
    function process(node) {
        let children = node.children;

        createTag(node);
        if (children && children.length) {
            processChild(children);
        }
        if (node.type === 1) {
            handleTagEnd();
        }
    }

    /**
     * 简写
     */
    function processChild(children) {
        children.map(childNode => process(childNode));
    }

    /**
     * 处理单个节点
     */
    function createTag(node) {
        // console.log(node.tag)
        switch (node.type) {
            case 1:
                handleTagConvert(node);
                tpl += `<${node.tag}`;
                handleAttributes(node);
                handleStarTagEnd(node);
            break
            case 2:

            case 3:
                //文本和注释
                if (node.isComment) {
                    tpl += `<!-- ${node.text} -->`;
                } else {
                    tpl += node.text;
                }
            break
        }
    }

    /**
     * 根据stack关闭标签
     */
    function handleTagEnd () {
        tpl += `</${stack.pop().tag}>`;
    }
}

var swan2vueOptions = {

    compileOptions,

    postcssPlugins: [],

    compileASTHandle: {
        compile: compileASTToTemplate
    },
    
};

const fs = require('fs');
const path = require('path');

const config = {
    swan2vueOptions,
};

// const isBuiltInTag = makeMap('slot,component')
// const isReservedAttribute = makeMap('key,ref,slot,slot-scope,is')

let template = {
    convert (path, rawConfig) {
        let content = fs.readFileSync(path, 'utf8');
        let compiled = template.compile(content, rawConfig);
        let tpl = template.compileAST(compiled.ast, rawConfig);
        
        process.env.NODE_ENV === 'development' &&
            template.writeTemplateToFIle(tpl, path, rawConfig);

        return tpl
    },
    compile (content, rawConfig) {

        let compileOptions = config[`${rawConfig.plat}2vueOptions`].compileOptions;
        let compile = createCompiler(compileOptions).compile;
        let ast = compile(content, compileOptions);

        return {
            errors: [],
            ast,
        }
    },
    compileAST (ast, rawConfig) {
        let astHandle = config[`${rawConfig.plat}2vueOptions`].compileASTHandle;
        let tpl = astHandle.compile(ast);

        return tpl
    },
    writeTemplateToFIle (tpl, rawFilePath, rawConfig) {
        let writePath = path.join(__dirname, rawConfig.writePath || './');
        console.log(rawFilePath, writePath);
        let writeFileName = rawFilePath.match(/([^\\|\/]+)\..*$/)[1];
        fs.writeFileSync(
            writePath + writeFileName+'.html', 
            tpl + `
                <script src="./swan-template.js"></script>
                <link rel="stylesheet" href="./swan-template.css" type="text/css" />
            `
        );
    },
};

const fs$1 = require('fs');
const path$1 = require('path');
const postcss = require('postcss');

let style = {
    convert (path, rawConfig) {
        let content = fs$1.readFileSync(path, 'utf8');

        postcss(swan2vueOptions.postcssPlugins)
            .process(content, { from: undefined, to: undefined })
            .then(compiled => {
                // console.log(compiled)

                process.env.NODE_ENV === 'development' &&
                    style.writeStyleToFIle(compiled.css, path, rawConfig);
            });

    },
    writeStyleToFIle (tpl, rawFilePath, rawConfig) {
        let writePath = path$1.join(__dirname, rawConfig.writePath || './');
        let writeFileName = rawFilePath.match(/([^\\|\/]+)\..*$/)[1];

        fs$1.writeFileSync(writePath + writeFileName+'.css', tpl);
    },
};

const fileHandle = {
    extract,
    template,
    style,
};

/** Compiler
 *
 * @var { Array, String } folder 
 * @var { String } config.plat required [ 'swan', 'wx', 'ali' ]
 * @var { String } config.type [ 'template', 'style', 'javascript', 'all' ]
 */
function convert(folder, config) {

    config = extend({ type: "all" }, config);

    let folders = folder instanceof Array ? folder : [folder];


    /** 遍历每一个页面, 不同的文件后缀采用不同的compiler转换 */

    let pages = fileHandle.extract(folders, config);
        pages.forEach(pageComponent => {
            pageComponent.forEach(file => {
                let suffixMap = extract.fixMap[config.plat],
                    suffixMapRev = {},
                    suffixRe = /\..*$/;
                
                for (let key in suffixMap) {
                    suffixMapRev[suffixMap[key]] = key;
                }
                let suffix = file.match(suffixRe),
                    compilerHandle = suffixMapRev[suffix];

                fileHandle[compilerHandle].convert(file, config);
            });
        });
}

var Compiler = {
    convert
};

const path$2 = require('path');

var unsolvedFolder = path$2.resolve(__dirname, '../src/swan/swan-template');
// console.log(unsolvedFolder)

Compiler.convert(unsolvedFolder, {
    plat: 'swan',
    type: ['template', 'style'],
});
