import {DOMparser} from "fast-html-dom-parser"
import {readFileSync} from "fs"

let pages = ['google', 'mozilla', 'sk', 'svelte', 'emoji-favicon']
    .map(name => '../fixtures/'+name+'.html')
    .map(path => readFileSync(path).toString())

function extractUrl(root, tags, attributes) {
    let elements = [];
    for (let tagIndex = 0; tagIndex < tags.length; tagIndex++) {
        elements = [...elements, ...root.getElementsByTagName(tags[tagIndex])]
    }
    return elements.reduce((all, element) => {
        /** @type {HTMLElement} element */
        for (let attrIndex = 0; attrIndex < attributes.length; attrIndex++) {
            if (element.getAttribute(attributes[attrIndex])) {
                all.push(element.getAttribute(attributes[attrIndex]).trim())
            }
        }
        return all;
    }, [])
}

for (let index = 0; index < pages.length; index++) {
    let source = pages[index]
    const element = new DOMparser(source);

    let urls = [
        ...extractUrl(element, ['a', 'link', 'area'], ['href']),
        ...extractUrl(element, ['img', 'source', 'audio', 'embed', 'iframe', 'input', 'script', 'track', 'video'], ['src']),
        ...extractUrl(element, ['blockquote', 'del', 'ins', 'q'], ['cite']),
        ...extractUrl(element, ['object'], ['data']),
        ...extractUrl(element, ['video'], ['poster']),
        ...extractUrl(element, ['img', 'source'], ['srcset']).reduce((all, url) => {
            let defs = url.split(/\s*,\s*/)
            for (let defIndex = 0; defIndex < defs.length; defIndex++) {
                all.push(defs[defIndex].split(/\s+/, 1)[0])
            }
            return all
        }, []),
    ]

    urls = urls.filter(url => {
        return !url.startsWith('data:') && !url.startsWith('#') && !/^(\w+:)?\/\//.test(url)
    })

    console.log(urls)
}