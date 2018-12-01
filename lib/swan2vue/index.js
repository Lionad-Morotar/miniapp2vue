import { makeMap } from '../../util/index'

import { baseCompileOptions } from '../config'

const tpl = ''

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
    'checkbox': 'checkbox',
    'checkbox-group': 'checkbox-group',
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
    'wev-view': 'iframe-src',
}
const isWhiteTag = (tagName) => {
    return tagConvertMap[tagName]
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

    console.log(tpl)

    /**
     * 處理Tag轉換
     */
    function handleTagConvert (node) {
        if (isWhiteTag(node.tag)) {
            node.tag = tagConvertMap[node.tag]
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
        )
        node.attrsList.map(attr => {
    
            /** handle name */
            let reflexAttrName = attrNameMap(attr.name) || attr.name
            tpl += ` ${reflexAttrName}`
    
            /** handle value */
            if (attr.value) {
                let realVal = attr.value
                tpl += `="${realVal}"`
            }
        })
        // console.log(tpl)
    }

    /**
     * 根据是否是自闭合标签结束开始标签
     */
    function handleStarTagEnd (node) {
        tpl += node.unary ? '/>' : '>'
        ;!node.unary && stack.push({
            tag: node.tag
        })
    }

    /**
     * 尝试根据stack的深度缩进
     */
    function createBlink () {
        return Array.apply(null, {length: stack.length}).map(_ => '    ').join('')
    }

    /**
     * 處理chars
     */
    function handleChars (node) {
        // console.log(node.text)
        // tpl += node.text
    }

    /** MAIN
     *  处理stack
     */
    function process(node) {
        let children = node.children

        createTag(node)
        if (children && children.length) {
            processChild(children)
        }
        if (node.type === 1) {
            handleTagEnd()
        }
    }

    /**
     * 简写
     */
    function processChild(children) {
        children.map(childNode => process(childNode))
    }

    /**
     * 处理单个节点
     */
    function createTag(node) {
        switch (node.type) {
            case 1:
                handleTagConvert(node)
                tpl += `<${node.tag}`
                handleAttributes(node)
                handleStarTagEnd(node)
            break
            case 2:
                handleChars(node)
            case 3:
                //文本和注释
                if (node.isComment) {
                    tpl += `<!-- ${node.text} -->`
                } else {
                    tpl += node.text
                }
            break
        }
        return tpl
    }

    /**
     * 根据stack关闭标签
     */
    function handleTagEnd () {
        tpl += `</${stack.pop().tag}>`
    }
}

export default {

    compileOptions,

    compileASTHandle: {
        compile: compileASTToTemplate
    }
    
}