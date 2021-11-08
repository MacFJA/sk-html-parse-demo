import {Parser} from "htmlparser2";
import {readFileSync} from "fs"

let pages = ['google', 'mozilla', 'sk', 'svelte', 'emoji-favicon']
    .map(name => '../fixtures/'+name+'.html')
    .map(path => readFileSync(path))

for (let index = 0; index < pages.length; index++) {
    let source = pages[index]
    let urls = [];
    const sourceParser = new Parser({
        onopentag(name, attribs) {
            if (['a', 'link', 'area'].includes(name) && Object.keys(attribs).includes('href')) {
                urls.push(attribs['href'])
            }
            if (['img', 'source', 'audio', 'embed', 'iframe', 'input', 'script', 'track', 'video'].includes(name) && Object.keys(attribs).includes('src')) {
                urls.push(attribs['src'])
            }
            if (['blockquote', 'del', 'ins', 'q'].includes(name) && Object.keys(attribs).includes('cite')) {
                urls.push(attribs['cite'])
            }
            if (['object'].includes(name) && Object.keys(attribs).includes('data')) {
                urls.push(attribs['data'])
            }
            if (['video'].includes(name) && Object.keys(attribs).includes('poster')) {
                urls.push(attribs['poster'])
            }
            if (['image', 'source'].includes(name) && Object.keys(attribs).includes('srcset')) {
                attribs['srcset'].split(/\s*,\s*/).forEach(def => {
                    urls.push(def.split(/\s+/, 1)[0])
                })
            }
        }
    })
    sourceParser.write(source.toString())
    sourceParser.end()

    urls = urls.filter(url => {
        return !url.startsWith('data:') && !url.startsWith('#') && !/^(\w+:)?\/\//.test(url)
    })

    console.log(urls)
}