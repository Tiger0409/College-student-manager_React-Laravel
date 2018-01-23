import React from 'react'
import { Link } from 'react-router'
import { ROLES } from './../../../config/constants.js'
import UsersAdmin from './../../admin/UsersAdmin.jsx'

export default class Users extends React.Component {
    constructor(props, context) {
        super(props, context)
        this.state = { childTypeKey: null }
        this.childTypes = {
            [ROLES.SUPER_ADMIN]: UsersAdmin,
            [ROLES.ADMIN]: UsersAdmin
        }
    }

    render() {
        const { appTypeKey } = this.props
        let { children } = this.props

        let ConcreteComponent = () => (<div></div>)

        if (appTypeKey in this.childTypes) {
            ConcreteComponent = this.childTypes[appTypeKey]
        }

        children = children ?
            React.cloneElement(children, { appTypeKey: appTypeKey }) : ''

        return (
            <div>
                <ConcreteComponent/>
                <div id="notifications"></div>
                {children}
            </div>
        )
    }
}