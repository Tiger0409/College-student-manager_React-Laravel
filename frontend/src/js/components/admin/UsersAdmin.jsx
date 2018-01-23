import React, { Component } from 'react'
import NavJustified from './../common/NavJustified.jsx'
import { LinkContainer } from 'react-router-bootstrap'
import { NavItem } from 'react-bootstrap'

export default class UsersAdmin extends Component {
    render() {
        let menu = [
            { label: 'Student List',     route: '/users/role/students' },
            { label: 'Teacher List',     route: '/users/role/teachers' },
            { label: 'Teacher Payments', route: '/teachers-register' },
            { label: 'Staff List',       route: '/users/role/staff' },
            { label: 'Reconcile List',   route: '/users/reconcile' },
            { label: 'Waiting List',     route: '/users/waiting' }
        ]
        return (
            <div className="admin-nav-secondary">
                <div className="container">
                    <NavJustified activeKey={0}>
                        {menu.map((item, i) =>
                            (<LinkContainer key={i} to={{ pathname: item.route }}>
                                <NavItem eventKey={i}>{item.label}</NavItem>
                            </LinkContainer>)
                        )}

                    </NavJustified>
                </div>
            </div>
        )
    }
}