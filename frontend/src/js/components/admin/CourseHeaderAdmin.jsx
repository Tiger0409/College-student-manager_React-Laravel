import React, { PropTypes, Component } from 'react'
import { NavItem } from 'react-bootstrap'
import NavJustified from './../common/NavJustified.jsx'
import { LinkContainer } from 'react-router-bootstrap'
import { ROLES } from '../../config/constants'
import Oh from '../../utils/ObjHelper'

export default class CourseHeaderAdmin extends React.Component {
    constructor(props, context) {
        super(props, context)
        this.activeKeyValues = [
            '/courses', '/classes', '/depts', '/classrooms', '/debtors'
        ]
    }

    render() {
        const { selectedTab } = this.props
        const uri = window.location.pathname
        let isSelected = []

        for (let i in this.activeKeyValues) {
            let activeKey = this.activeKeyValues[i]
            if (selectedTab) {
                const isActive = selectedTab === activeKey
                isSelected.push(isActive)
                if (isActive) break
            } else {
                isSelected.push(uri.indexOf(activeKey) !== -1)
            }
        }

        const staff = [ROLES.REGISTRAR, ROLES.ADMIN, ROLES.SUPER_ADMIN]
        const admins = [ROLES.ADMIN, ROLES.SUPER_ADMIN]

        return (
            <div className="admin-nav-secondary">
                <div className="container">
                    <NavJustified>
                        <UserTabLink to={{ pathname: '/courses' }} roles={staff}>
                            <NavItem
                                className={isSelected[0] ? 'active': ''}>
                                Course List
                            </NavItem>
                        </UserTabLink>

                        <UserTabLink to={{ pathname: "/classes" }} roles={staff}>
                            <NavItem
                                className={isSelected[1] ? 'active' : ''}>
                                Class list
                            </NavItem>
                        </UserTabLink>

                        <UserTabLink to={{ pathname: '/depts' }} roles={admins}>
                            <NavItem
                                className={isSelected[2] ? 'active' : ''}>
                                Dept list
                            </NavItem>
                        </UserTabLink>

                        <UserTabLink to={{ pathname: '/classrooms' }} roles={admins}>
                            <NavItem
                                className={isSelected[3] ? 'active' : ''}>
                                Classrooms
                            </NavItem>
                        </UserTabLink>

                        <UserTabLink to={{ pathname: '/debtors' }} roles={admins}>
                            <NavItem
                                className={isSelected[4] ? 'active' : ''}>
                                Debtors
                            </NavItem>
                        </UserTabLink>
                    </NavJustified>
                </div>
            </div>
        )
    }
}

class UserTabLink extends Component {
    render() {
        const { roles, to, children } = this.props

        if (!roles.includes(Oh.getIfExists(this, 'context.user.role.roleName', 'None'))) return false

        return (
            <LinkContainer to={to}>
                {children}
            </LinkContainer>
        )
    }
}

UserTabLink.contextTypes = {
    user: PropTypes.object.isRequired
}