import React from 'react'
import { ROLES } from './../../config/constants.js'
import DashboardAdmin from './../admin/DashboardAdmin.jsx'
import DashboardRegistrar from './../registrar/DashboardRegistrar.jsx'

export default class Dashboard extends React.Component {
    constructor(props, context) {
        super(props, context)

        this.state = {childTypeKey: null}
        this.childTypes = {
            [ROLES.REGISTRAR]: DashboardRegistrar,
            [ROLES.ADMIN]: DashboardAdmin,
            [ROLES.SUPER_ADMIN]: DashboardAdmin
        }
    }

    render() {
        if (this.props.appTypeKey in this.childTypes) {
            var ConcreteComponent = this.childTypes[this.props.appTypeKey]
            var children = this.props.children ?
                React.cloneElement(this.props.children, {appTypeKey: this.props.appTypeKey}) : ''

            return (
                <div>
                    <ConcreteComponent />
                    {children}
                </div>
            )
        }

        return false
    }
}