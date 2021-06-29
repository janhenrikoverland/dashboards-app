const isRelative = path => path.startsWith('./')
const normalizeRelativePath = path =>
    [process.env.PUBLIC_URL, path.replace(/^\.\//, '')].join('/')

const getScriptElement = src =>
    document.querySelector('script[src="' + src + '"]')

export const loadExternalScript = isRecording => src => {
    if (isRelative(src)) {
        src = normalizeRelativePath(src)
    }

    return new Promise((resolve, reject) => {
        const scriptEl = getScriptElement(src)
        if (scriptEl && !isRecording) {
            return resolve()
        }

        if (scriptEl) {
            console.log(`Dynamic Script Removed: ${src}`)
            document.head.removeChild(scriptEl)
            if (src.indexOf('babel-polyfill') >= -1) {
                global._babelPolyfill = false
            }
        }

        const element = document.createElement('script')

        element.src = src
        element.type = 'text/javascript'
        element.async = false

        const cleanup = () => {
            console.log(`Dynamic Script Removed: ${src}`)
            document.head.removeChild(element)
        }

        element.onload = () => {
            console.log(`Dynamic Script Loaded: ${src}`)
            try {
                resolve()
            } catch (e) {
                cleanup()
                reject()
            }
        }

        element.onerror = () => {
            console.error(`Dynamic Script Error: ${src}`)
            cleanup()
            reject()
        }

        document.head.appendChild(element)
    })
}
