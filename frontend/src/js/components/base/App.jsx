import React, { PropTypes, Component } from 'react'
import Auth from './../../utils/Auth.js'
import AppAdmin from './../admin/AppAdmin.jsx'
import AppStudent from '../students/AppStudent.jsx'
import AppRegistrar from '../registrar/AppRegistrar.jsx'
import Ph from '../../utils/PromiseHelper.js'
import Oh from '../../utils/ObjHelper'
import { ROLES } from './../../config/constants.js'
import Spinner from '../common/Spinner.jsx'
import NetworkWatcher from '../common/NetworkWatcher.jsx'

export default class App extends Component {
    constructor(props, context) {
        super(props, context)
        this.promises = {}
        this.appTypes = {
            [ROLES.SUPER_ADMIN]: AppAdmin,
            [ROLES.ADMIN]: AppAdmin,
            [ROLES.GUEST]: AppStudent,
            [ROLES.STUDENT]: AppStudent,
            [ROLES.REGISTRAR]: AppRegistrar
        }

        this.updateUserInfo = this.updateUserInfo.bind(this)
        this.loadWebsiteData = this.loadWebsiteData.bind(this)
        this.state = { appTypeKey: null, contextData: {}, loadings: [this.loadWebsiteData, this.updateUserInfo] }
    }

    replaceRouter() {
        let { router } = this.context

        let newRouter = {}
        Object.assign(newRouter, router)

        var toOverload = ['push', 'go', 'goBack', 'goForward']
        toOverload.forEach(method => {
            newRouter[method] = props => {
                if (!window.onReactNavigate || window.onReactNavigate()) {
                    router[method](props)
                }
            }
        })

        this.changeContext('router', newRouter)
    }

    getChildContext() {
        return this.state.contextData
    }

    changeContext(name, value) {
        var { contextData } = this.state
        contextData[name] = value
        this.setState({ contextData: contextData })
    }

    render() {
        const { appTypeKey, loadings } = this.state

        if (loadings.length > 0) return <Spinner />

        if (appTypeKey in this.appTypes) {
            var ConcreteApp = this.appTypes[appTypeKey]
            var children = this.props.children ?
                React.cloneElement(
                    this.props.children,
                    { appTypeKey: appTypeKey, onUserUpdate: this.updateUserInfo }
                ) : ''

            return (
                <div>
                    <NetworkWatcher />

                    <ConcreteApp onUserUpdate={this.updateUserInfo} children={children} />
                </div>
            )
        }

        return false
    }

    componentWillMount() {
        this.load()
        this.replaceRouter()
        setInterval(this.updateUserInfo, 60000)
    }

    load() {
        let { loadings } = this.state

        const remove = func => {
            const index = loadings.indexOf(func)
            if (index !== -1) {
                loadings.splice(index, 1)
                this.setState({ loadings: loadings })
            }
        }

        let afterLoads = []
        loadings.forEach(loader => {
            loader(afterLoad => {
                remove(loader)
                if (afterLoad) afterLoads.push(afterLoad)
            })
        })

        afterLoads.forEach(func => func())
    }

    loadWebsiteData(onEnd) {
        this.promises.website = Ph.ajax({
            type: 'get',
            url: '/api/website'
        })

        this.promises.website.then(
            website => {
                if (website.name) $('title').text(website.name)
                website.set = (name, value) => {
                    website[name] = value
                    this.changeContext('website', website)
                }

                this.changeContext('website', website)
                if (onEnd) onEnd()
            },
            xhr => { console.log(xhr); if (onEnd) onEnd() }
        )
    }

    updateUserInfo(url, onEnd) {
        const { router } = this.context

        // "overloading"
        if (typeof url == 'function' && !onEnd) {
            onEnd = url
            url = null
        }

        Auth.requestUser(
            user => {
                if (this.state.appTypeKey == Oh.getIfExists(user, 'role.roleName', ROLES.GUEST)) {
                    return
                }

                this.setState({ appTypeKey: user.role.roleName })
                this.changeContext('user', user)
                if (onEnd) {
                    onEnd(() => { if (url) router.push(url) })
                } else {
                    if (url) router.push(url)
                }
            },
            (xhr, status, errorMsg) => {
                if (this.state.appTypeKey == ROLES.GUEST) {
                    return
                }

                url = '/login'

                if (xhr.status === 401) {
                    this.changeContext('user', null)
                } else {
                    console.error(xhr.responseText)
                    return
                }

                this.setState({ appTypeKey: ROLES.GUEST })

                if (onEnd) {
                    onEnd(() => router.push(url))
                } else {
                    router.push(url)
                }
            }
        )
    }
}

App.contextTypes = {
    router: PropTypes.object.isRequired
}

App.childContextTypes = {
    user: PropTypes.object,
    website: PropTypes.object,
    router: PropTypes.object
}