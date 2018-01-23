import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { NavItem } from 'react-bootstrap'
import NavJustified from './../common/NavJustified.jsx'
import { LinkContainer } from 'react-router-bootstrap'
import { ROLES } from '../../config/constants.js'
import Oh from '../../utils/ObjHelper.js'


export default class HeaderRegistrar extends Component {
    constructor(props, context) {
        super(props, context)
        this.tabRoutesMap = {
            'dashboard': '/dashboard',
            'new-user': '/new-user',
            'courses': '/courses',
            'profile': '/profile',
            'complaints': '/complaints'
        }
    }

    render() {
        var uri = window.location.pathname

        var selectedTab = null
        var mapKeys = Object.keys(this.tabRoutesMap)
        for (let i in mapKeys) {
            if (selectedTab != null) break
            let mapKey = mapKeys[i]
            let routes = this.tabRoutesMap[mapKey]
            if (!Array.isArray(routes)) routes = [routes]

            for (let j in routes) {
                if (uri.includes(routes[j])) {
                    selectedTab = mapKey
                    break
                }
            }
        }

        let routeTabs = [
            { route: 'dashboard',  label: 'Dashboard' },
            { route: 'new-user',   label: 'Add Student' },
            { route: 'courses',    label: 'Course'},
            { route: 'complaints', label: 'Complaints' }
        ]

        return (
            <div className='admin-nav'>
                <div className="container">
                    <NavJustified>
                    {
                        routeTabs.map(
                            (routeTab, i) => (
                                <LinkContainer key={i} to={{ pathname: `/${routeTab.route}` }}>
                                    <NavItem className={selectedTab == routeTab.route ? 'active' : ''}>
                                        {routeTab.label}
                                    </NavItem>
                                </LinkContainer>
                            )
                        )
                    }
                    </NavJustified>
                </div>
            </div>
        )
    }
}