import {parse} from "parse5"
import {readFileSync} from "fs"

let pages = ['google', 'mozilla', 'sk', 'svelte', 'emoji-favicon']
    .map(name => '../fixtures/'+name+'.html')
    .map(path => readFileSync(path).toString())

function getElementsByTagName(e, tagName){
    let res = [];
    e.childNodes.forEach((e) => {
        if(e.tagName === tagName) res.push(e);
        if(e.childNodes && e.childNodes.length > 0) res = res.concat(getElementsByTagName(e, tagName));
    })
    return res;
}

function extractUrl(root, tags, attributes) {
    let elements = [];
    for (let tagIndex = 0; tagIndex < tags.length; tagIndex++) {
        elements = [...elements, ...getElementsByTagName(root, tags[tagIndex])]
    }
    return elements.reduce((all, element) => {
        /** @type {HTMLElement} element */
        let elementAttr = element.attrs.filter(a => attributes.includes(a.name)).map(a => a.value)
        if (elementAttr.length > 0) {
            all.push(...elementAttr)
        }
        return all;
    }, [])
}

for (let index = 0; index < pages.length; index++) {
    let source = pages[index]
    const element = parse(source);

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