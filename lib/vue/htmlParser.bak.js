// 一维的不可嵌套的标签
var isUnaryTag = makeMap(
    'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
    'link,meta,param,source,track,wbr'
)

// Elements that you can, intentionally, leave open
// (and which close themselves)
// 可以显式自关闭的标签
var canBeLeftOpenTag = makeMap(
    'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'
)

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
)

// Special Elements (can contain anything)
// 可以包含任何内容的节点(不被htmlParser继续遍历解析)
var isPlainTextElement = makeMap('script,style,textarea', true)

// 可以包含'\n'的节点
var isIgnoreNewlineTag = makeMap('pre,textarea', true)
// #5992
var shouldIgnoreFirstNewline = function (tag, html) { 
    return tag && isIgnoreNewlineTag(tag) && html[0] === '\n'
}

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
var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/

// could use https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName
// but for Vue templates we can enforce a simple charset
// 本来可以使用NT-Qualified (Tag) Name
// 但是作为Vue而言, 使用简单的检验规则就可以了
var ncname = '[a-zA-Z_][\\w\\-\\.]*'
// 捕获可能含有命名空间的Tag
var qnameCapture = "((?:" + ncname + "\\:)?" + ncname + ")"

// 标记 Tag 语句开头
var startTagOpen = new RegExp(("^<" + qnameCapture))

// 标记 Tag 语句结尾
var startTagClose = /^\s*(\/?)>/

// 标记结尾的 Tag
var endTag = new RegExp(("^<\\/" + qnameCapture + "[^>]*>"))

// 匹配 DOCTYPE
var doctype = /^<!DOCTYPE [^>]+>/i

// #7298: escape - to avoid being pased as HTML comment when inlined in page
var comment = /^<!\--/
var conditionalComment = /^<!\[/;


// 测试环境下replace的正则参数是否能正常运行
// 用来解决FF下某个BUG
var IS_REGEX_CAPTURING_BROKEN = false
'x'.replace(/x(.)?/g, function (m, g) {
    IS_REGEX_CAPTURING_BROKEN = g === ''
})

var reCache = {}

var decodingMap = {
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&amp;': '&',
    '&#10;': '\n',
    '&#9;': '\t'
}

// #(2018年11月21日 17点59分) 转码特殊字符
var encodedAttr = /&(?:lt|gt|quot|amp);/g
var encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#10|#9);/g
function decodeAttr (value, shouldDecodeNewlines) {
    var re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr;
    return value.replace(re, function (match) { return decodingMap[match]; })
}

/** 部分浏览器会将节点内属性(值)内的一些字符等转义(见 decodingMap)
 * 
 */
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

    var isUnaryTag$$1 = options.isUnaryTag || no;

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
    var canBeLeftOpenTag$$1 = options.canBeLeftOpenTag || no;

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
                    var commentEnd = html.indexOf('-->')

                    if (commentEnd >= 0) {
                        if (options.shouldKeepComment) {
                            options.comment(html.substring(4, commentEnd))
                        }
                        advance(commentEnd + 3)
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
            })

            index += html.length - rest$1.length
            html = rest$1

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
            }
            advance(start[0].length)

            var end, attr;
            // 只要没到标签结束 (类似`/>`), 则一直匹配属性并推入堆栈
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                advance(attr[0].length);
                match.attrs.push(attr);
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
        var pos, lowerCasedTagName
        if (start == null) {
            start = index
        }
        if (end == null) {
            end = index
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
                if ("development" !== 'production' &&
                    (i > pos || !tagName) &&
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