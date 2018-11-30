/**
 * @file origin from VueJS
 */

import { makeAttrsMap } from '../util/index'

import { parseHTML } from './htmlParser'

import { no } from '../util/index'

function isTextTag (el) {
    return el.tag === 'script' || el.tag === 'style'
}

function createCompileToFunctionFn(compile) {
    var cache = Object.create(null);

    return function compileToFunctions(
        template,
        options,
        vm
    ) {
        options = extend({}, options);
        var warn$$1 = options.warn || warn;
        delete options.warn;

        // check cache
        var key = options.delimiters ?
            String(options.delimiters) + template :
            template;
        if (cache[key]) {
            return cache[key]
        }

        // compile
        var compiled = compile(template, options);

        // turn code into functions
        var res = {};
        var fnGenErrors = [];
        res.render = createFunction(compiled.render, fnGenErrors);
        res.staticRenderFns = compiled.staticRenderFns.map(function (code) {
            return createFunction(code, fnGenErrors)
        });

        return (cache[key] = res)
    }
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

            if (options) {
                // copy other options
                for (var key in options) {
                    if (key !== 'modules' && key !== 'directives') {
                        finalOptions[key] = options[key];
                    }
                }
            }

            var compiled = baseCompile(template, finalOptions)

            compiled.errors = errors
            compiled.tips = tips

            return compiled
        }

        return {
            compile: compile,
            // compileToFunctions: createCompileToFunctionFn(compile)
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
        shouldKeepComment: options.comments,
        start: function start(tag, attrs, unary) {
            
            var ns = (currentParent && currentParent.ns) || options.getTagNamespace(tag)

            var element = createASTElement(tag, attrs, currentParent)

            if (ns) {
                element.ns = ns
            }

            if (platformIsPreTag(element.tag)) {
                inPre = true
            }

            function checkRootConstraints(el) {
                if (process.env.NODE_ENV !== 'production') {
                    if (el.tag === 'slot' || el.tag === 'template') {
                        warnOnce(
                            "Cannot use <" + (el.tag) + "> as component root element because it may " +
                            'contain multiple nodes.'
                        );
                    }
                    if (el.attrsMap.hasOwnProperty('v-for')) {
                        warnOnce(
                            'Cannot use v-for on stateful component root element because ' +
                            'it renders multiple elements.'
                        );
                    }
                }
            }

            // tree management
            if (!root) {
                root = element;
                checkRootConstraints(root);
            } else if (!stack.length) {
                // allow root elements with v-if, v-else-if and v-else
                if (root.if && (element.elseif || element.else)) {
                    checkRootConstraints(element);
                    addIfCondition(root, {
                        exp: element.elseif,
                        block: element
                    });
                } else if (process.env.NODE_ENV !== 'production') {
                    warnOnce(
                        "Component template should contain exactly one root element. " +
                        "If you are using v-if on multiple elements, " +
                        "use v-else-if to chain them instead."
                    );
                }
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

        end: function end() {
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

        chars: function chars(text) {
            currentParent.children.push({
                type: 2,
                text: text
            })
        },
        comment: function comment(text) {
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

    return ast
})

export { createCompiler }