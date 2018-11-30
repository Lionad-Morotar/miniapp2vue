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

const swan2vueOptions = {
    expectHTML: baseCompileOptions.expectHTML,
    isUnaryTag: baseCompileOptions.isUnaryTag,
    canBeLeftOpenTag: baseCompileOptions.canBeLeftOpenTag,
    shouldDecodeNewlines: baseCompileOptions.shouldDecodeNewlines,
    shouldDecodeNewlinesForHref: baseCompileOptions.shouldDecodeNewlinesForHref,
    shouldKeepComment: baseCompileOptions.comments,
    getTagNamespace: baseCompileOptions.getTagNamespace,
    start (tagName, attrs, unary, start, end) {
        // console.log(arguments)
        let name = mapTagName(tagName)
        // let index = createBlink()
        compiledHTML += `<${name}`
        handleAttributes(attrs)
        handleStarTagEnd(unary)
        // stacks ++
    },
    end (tagName, start, end) {
        // console.log(arguments)
        // stacks --
        let name = mapTagName(tagName)
        compiledHTML += `</${name}>`
    },
    chars (content) {
        compiledHTML += content
    }
}

export { swan2vueOptions }