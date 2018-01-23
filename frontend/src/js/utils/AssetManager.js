class Asset {
    constructor(path, root) {
        this.path = path
        this.root = root ? root : 'head'
    }

    load() {}

    unload() {}
}

class CssAsset extends Asset {
    load() {
        $(() => {
            const element = `<link rel="stylesheet" type="text/css" href="${this.path}" />`
            $(this.root).append(element)
        })
    }

    unload() {
        $(`${this.root} link[href="${this.path}"]`).remove()
    }
}

class JsAsset extends Asset {
    load(onLoad) {
        $(() => {
            // if already loaded
            if ($(`script[src="${this.path}"]`).length > 0) {
                onLoad()
                return
            }

            const element = `<script type="application/javascript" src="${this.path}" />`
            $(this.root).append(element)

            var updates = 10;
            this.waitingForLoad = setInterval(() => {
                if ($(`script[src="${this.path}"]`).length > 0) {
                    onLoad()
                    clearInterval(this.waitingForLoad)
                }

                updates--;
                if (updates == 0) {
                    clearInterval(this.waitingForLoad)
                    throw new Error(`Resource ${this.path} was not loaded`)
                }
            }, 500)
        })
    }

    unload() {
        $(`${this.root} link[href="${this.path}"]`).remove()
    }
}

export default class AssetManager {
    constructor() {
        this.loaded = []
    }

    assetLoaded(path) {
        for (let i in this.loaded) {
            if (this.loaded[i].path == path) {
                return true
            }
        }

        return false
    }

    loadCss(path) {
        if (this.assetLoaded(path)) {
            return
        }

        let asset = new CssAsset(path)
        asset.load()
        this.loaded.push(asset)
    }

    loadJs(path, onLoad) {
        if (this.assetLoaded(path)) {
            onLoad && onLoad()
            return
        }

        let asset = new JsAsset(path)
        asset.load(onLoad)
        this.loaded.push(asset)
    }

    unloadAll() {
        this.loaded.forEach(asset => asset.unload())
    }
}