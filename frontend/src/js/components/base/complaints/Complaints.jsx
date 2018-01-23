import React, { PropTypes, Component } from 'react'
import RoleFilter from '../../common/RoleFilter'
import { ROLES } from '../../../config/constants.js'
import { NavItem } from 'react-bootstrap'
import NavJustified from '../../common/NavJustified.jsx'

export class Complaints extends Component {
    constructor(props, context) {
        super(props, context)
        this.tabRoutes = {
            'List': ['/complaints', '/complaints/list'],
            'Add': '/complaints/add',
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
                if (uri === routes[i]) {
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
            <div>
                <div className='admin-nav-secondary'>
                    <div className="container">
                        <NavJustified>
                            {tabs}
                        </NavJustified>
                    </div>
                </div>

                {this.props.children}
            </div>
        )
    }
}

Complaints.contextTypes = {
    router: PropTypes.object.isRequired
}

export default RoleFilter(Complaints, [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.REGISTRAR])