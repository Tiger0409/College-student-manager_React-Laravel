import React, { PropTypes, Component } from 'react'
import Oh from '../../utils/ObjHelper.js'

export default (InnerComponent, roles) => class extends Component {
    static allowedRoles() {
        return roles
    }

    render() {
        const { appTypeKey } = this.props

        if (!appTypeKey || !roles.includes(appTypeKey)) {
            return false
        }

        return (
            <InnerComponent {...this.props}  />
        )
    }
}