/**
 * @file origin from VueJS
 */

import { makeAttrsMap } from '../util/index'

import { parseHTML } from './htmlParser'

import { no } from '../util/index'

function isTextTag (el) {
    return el.tag === 'script' || el.tag === 'style'
}

function createCompilerCreator(baseCompile) {
    return function createCompiler(baseOptions) {
        function compile(
            template,
            options
        ) {
            var finalOptions = Object.create(baseOptions);
            var errors = []
            var tips = []

            var compiled = baseCompile(template, finalOptions)

            compiled.errors = errors
            compiled.tips = tips

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

    var stack = []
    var root
    var currentParent
    var inPre = false

    var preserveWhitespace = options.preserveWhitespace !== false
    var platformIsPreTag = options.isPreTag || no


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
            
            var ns = (currentParent && currentParent.ns) || options.getTagNamespace(tag)

            var element = createASTElement(tag, attrs, currentParent)

            // tag === 'checkbox' &&
            //     console.log(tag, attrs, element)

            if (ns) {
                element.ns = ns
            }

            if (platformIsPreTag(element.tag)) {
                inPre = true
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
            })
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
    var ast = parse(template.trim(), options)

    // console.log(ast.children)

    return ast
})

export { createCompiler }