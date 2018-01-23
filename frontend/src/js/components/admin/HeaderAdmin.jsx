import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { NavItem } from 'react-bootstrap'
import NavJustified from './../common/NavJustified.jsx'
import { LinkContainer } from 'react-router-bootstrap'
import { ROLES } from '../../config/constants.js'
import Oh from '../../utils/ObjHelper.js'

export default class HeaderAdmin extends Component {
    constructor(props, context) {
        super(props, context)
        this.tabRoutesMap = {
            courses: [
                '/courses', '/classes', '/depts', '/classrooms', '/attendance', '/debtors'
            ],
            course: [
                '/courses', '/classes', '/depts', '/classrooms', '/attendance', '/debtors'
            ],
            donations: [
                '/donations', '/donation-records'
            ],
            classes: '/classes',
            transactions: '/transactions',
            user: '/users',
            settings: '/settings',
            complaints: '/complaints'
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
            { route: 'dashboard', label: 'Dashboard' },
            { route: 'transactions/all', label: 'Transactions' },
            { route: 'courses', label: 'Course' },
            { route: 'users/role/students', label: 'User' },
            { route: 'donations', label: 'Donations' },
            { route: 'complaints', label: 'Complaints'},
            { route: 'settings/general', label: 'Settings' }
        ]

        const { user } = this.context

        if (Oh.getIfExists(user, 'role.roleName', '') == ROLES.SUPER_ADMIN) {
            routeTabs.push({ route: 'logs', label: 'Logs' })
        }

        return (
            <div className="admin-nav">
                <div className="container">
                    <NavJustified>
                        {
                            routeTabs.map(
                                (routeTab, i) => (
                                    <LinkContainer key={i} to={{ pathname: `/${routeTab.route}` }}>
                                        <NavItem
                                            className={selectedTab == routeTab.route ? 'active' : ''}
                                        >
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

HeaderAdmin.contextTypes = {
    user: PropTypes.object
}