import React from 'react'
import { Link } from 'react-router'
import { NavItem } from 'react-bootstrap'
import NavJustified from './../common/NavJustified.jsx'
import { LinkContainer } from 'react-router-bootstrap'

export default class HeaderGuest extends React.Component {
    render() {
        return (
            <div>
                <NavJustified activeKey={1}>
                    <LinkContainer to={{ pathname: '/dashboard' }}>
                        <NavItem eventKey={1} href="/dashboard">Dashboard</NavItem>
                    </LinkContainer>
                    <LinkContainer to={{ pathname: '/courses' }}>
                        <NavItem className="list-group-item-danger" eventKey={3}>Course (in dev)</NavItem>
                    </LinkContainer>
                    <LinkContainer to={{ pathname: '/users' }}>
                        <NavItem eventKey={4}>User</NavItem>
                    </LinkContainer>
                </NavJustified>
            </div>
        )
    }
}