import { baseCompileOptions } from '../config'

const compiledHTML = ''

function mapTagName (tagName) {
    let reflexTagName = null
    // switch or map ...
    switch (tagName) {
        case 'view':
            reflexTagName = 'div'
        break
        default:
            reflexTagName = tagName
        break
    }
    return reflexTagName
}
function handleAttributes (attrs) {
    let attrNameMap = makeMap(
        ['s-if:v-if','s-else:v-else'].join(',')
    )
    attrs.map(attr => {

        /** handle name */
        let reflexAttrName = attrNameMap(attr.name) || attr.name
        compiledHTML += ` ${reflexAttrName}`

        /** handle value */
        if (attr.value) {
            let realVal = attr.value
            compiledHTML += `="${realVal}"`
        }
    })
}
function handleStarTagEnd (unary) {
    compiledHTML += unary ? '/>' : '>'
}
function createBlink () {
    return Array.apply(null, {length: stacks}).map(_ => '    ').join('')
}

const compileOptions = {
    expectHTML: baseCompileOptions.expectHTML,
    isUnaryTag: baseCompileOptions.isUnaryTag,
    canBeLeftOpenTag: baseCompileOptions.canBeLeftOpenTag,
    shouldDecodeNewlines: baseCompileOptions.shouldDecodeNewlines,
    shouldDecodeNewlinesForHref: baseCompileOptions.shouldDecodeNewlinesForHref,
    shouldKeepComment: baseCompileOptions.comments,
    getTagNamespace: baseCompileOptions.getTagNamespace,
}

function compileASTToTemplate (ast) {

    let stack = []
    let tpl = ''

    process(ast)

    function process(item) {
        let children = item.children
        createTag(item)
        if (children && children.length) {
            processChild(children)
        }
        if (item.type === 1) {
            closeTag(item)
        }
    }

    function processChild(children) {
        children.map(item => process(item))
    }

    function createTag(item) {
        switch (item.type) {
            case 1:
                {
                    if (isWhiteTag(item.tag)) { //非自定义标签，可以标准转换的tag list
                        item.tag = convertTag(item.tag);
                    } else {
                        throw new Error(`${item.tag} can\'t convert,wx is not support!`);
                    }
                    var insertContent = '';
                    tpl += `<${item.tag}`;
                    //处理attr
                    for (var key in item.attrsMap) {
                        var attrObjs = getRealAttr(key);
                        var cAttr = attrsConvertMap[attrObjs.type];
                        if (cAttr) {
                            var resObj = cAttr(key, item.attrsMap[key], attrObjs);
                            insertContent = resObj.insertContent || '';
                            tpl += resObj.tpl || '';
                        } else {
                            tpl += ` ${key}="${item.attrsMap[key]}" `;
                        }
                    }
                    if (isNotClosedTag(item.tag)) {
                        tpl += ` />`;
                    } else {
                        tpl += `>`;
                        //处理v-text,v-html,把插入标签的内容注入
                        tpl += insertContent;
                        stack.push({
                            tag: item.tag
                        });
                    }
                    break;
                }
            case 3:
                //文本和注释
                if (item.isComment) {
                    tpl += `<!-- ${item.text} -->`;
                } else {
                    tpl += item.text;
                }
                break;
        }

        return tpl
    }

    function closeTag(item) {
        let tagName = item.tag
        var pos
        
        if (tagName) {
            //从栈内找到闭合标签
            for (pos = stack.length - 1; pos >= 0; pos--) {
                if (stack[pos].tag === tagName) {
                    tpl += `</${tagName}>`
                    break
                }
            }
        } else {
            pos = 0;
        }
        if (pos >= 0) {
            //说明有标签没有闭合,丢弃	
            stack.length = pos
        }
    }
}

export default {

    compileOptions,

    compileASTHandle: {
        compile: compileASTToTemplate
    }
    
}