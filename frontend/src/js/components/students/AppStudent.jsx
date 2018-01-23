import React, { PropTypes, Component } from 'react'
import AppInstitute from './Institute/AppInstitute.jsx'

import AppEvents from './Events/AppEvents.jsx'
import Ph from '../../utils/PromiseHelper.js'

let templateFolder = ''

const templateFolderToApp = {
    'Institute': AppInstitute,
    'Events': AppEvents
}

export default class AppStudent extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { isLoading: false, website: null }
        this.promises = { load: null }
    }

    static getTemplatedComponent(componentName, params) {
        const TemplatedApp = templateFolderToApp[templateFolder]
        const getterName = `get${componentName}`
        if (!TemplatedApp || !TemplatedApp[getterName]) {
            return null
        }
        return TemplatedApp[getterName](params)
    }

    static renderTemplatedComponent(componentName) {
        const TemplatedComponent = AppStudent.getTemplatedComponent(componentName)

        if (!TemplatedComponent) {
            return <p>Component was not found</p>
        }

        return <TemplatedComponent />
    }

    load() {
        if (this.promises.load) {
            this.promises.load.cancel()
        }

        this.setState({ isLoading: true })

        this.promises.load = Ph.ajax({
            type: 'get',
            url: '/api/website'
        })

        this.promises.load.then(
            website => {
                if (website.name) $('title').text(website.name)


                this.setState({ isLoading: false, website: website })
            },
            xhr => console.log(xhr)
        )
    }

    componentWillMount() {
        templateFolder = this.context.website.folder
        //this.load()
    }

    render() {
        if (!templateFolder in templateFolderToApp) {
            return <p>Template folder was not found for this site</p>
        }

        const AppInstance = templateFolderToApp[templateFolder]

        if (!AppInstance) {
            return <p>Template folder was not found for this site</p>
        }
        return <AppInstance {...this.props} />
    }
}

AppStudent.contextTypes = {
    website: PropTypes.object
}
