const fs = require('fs')
import { parseHTML } from './htmlParser'
import { makeMap } from '../../util/index';

let template = {
    convert (paths) {
        return paths.map(path => {
            let content = fs.readFileSync(path, 'utf8')
            let compiled = template.compile(content)
            if (compiled.errors.length) {
                throw new Error(compiled.errors[0])
            }
            return template.compileAST(compiled.ast)
        })
    },
    compile (content) {

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

        let compiledHTML = ''
        let stacks = 0
        let options = {
            expectHTML: true,
            isUnaryTag: makeMap(''),
            canBeLeftOpenTag: makeMap(''),
            start (tagName, attrs, unary, start, end) {
                // console.log(arguments)
                let name = mapTagName(tagName)
                // let index = createBlink()
                compiledHTML += `<${name}`
                handleAttributes(attrs)
                handleStarTagEnd(unary)
                stacks ++
            },
            end (tagName, start, end) {
                // console.log(arguments)
                stacks --
                let name = mapTagName(tagName)
                compiledHTML += `</${name}>`
            },
            chars (content) {
                compiledHTML += content
            }
        }

        console.log(content)
        parseHTML(content, options)
        console.log(compiledHTML)

        return {
            errors: [],
            ast: []
        }
    },
    compileAST () {
        return []
    }
}

export default {
    convert: template.convert,
}
