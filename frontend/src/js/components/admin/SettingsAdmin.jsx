import React, { PropTypes, Component } from 'react'
import { NavItem } from 'react-bootstrap'
import NavJustified from './../common/NavJustified.jsx'

export default class SettingsAdmin extends Component {
    constructor(props, context) {
        super(props, context)
        this.tabRoutes = {
            'General': '/settings/general',
            'Multi Branches': ['/settings/multi-branches', '/websites', '/branches'],
/*            'Page Management': '/settings/pages',*/
            'Term': '/settings/terms',
            'Bank': '/settings/bank'
        }
    }

    navigate(route) {
        this.context.router.push(route)
    }

    render() {
        var uri = window.location.pathname
        var tabs = []

        for (let key in this.tabRoutes) {
            let routes = this.tabRoutes[key]
            let isSelected = false

            if (!Array.isArray(routes)) {
                routes = [routes]
            }

            for (let i in routes) {
                if (uri.includes(routes[i])) {
                    isSelected = true
                    break
                }
            }

            tabs.push(
                <NavItem
                    key={key}
                    className={isSelected ? 'active' : ''}
                    onClick={() => this.navigate(routes[0])}
                >
                    {key}
                </NavItem>
            )
        }

        return (
            <div className='admin-nav-secondary'>
                <div className="container">
                    <NavJustified>
                        {tabs}
                    </NavJustified>
                </div>
            </div>
        )
    }
}

SettingsAdmin.contextTypes = {
    router: PropTypes.object.isRequired
}

