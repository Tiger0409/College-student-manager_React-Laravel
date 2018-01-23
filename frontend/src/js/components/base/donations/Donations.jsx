import React, { Component, PropTypes } from 'react'
import { ROLES } from '../../../config/constants.js'
import DonationsAdmin from '../../admin/DonationsAdmin.jsx'
import DonationsStudents from '../../students/Donations.jsx'

export default class Donations extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {childTypeKey: null}
        this.childTypes = {
            [ROLES.ADMIN]: DonationsAdmin,
            [ROLES.SUPER_ADMIN]: DonationsAdmin,
            [ROLES.STUDENT]: DonationsStudents
        }
    }

    getChildComponent() {
        const { appTypeKey } = this.props
        if (appTypeKey in this.childTypes)
            return this.childTypes[appTypeKey]

        return false
    }

    getChildrenWithType() {
        const { children, appTypeKey } = this.props
        if (!children) return false

        return React.cloneElement(children, {appTypeKey: appTypeKey})
    }

    render() {
        const ConcreteComponent = this.getChildComponent()
        const children = this.getChildrenWithType()

        if (!ConcreteComponent) return false

        return (
            <div>
                <ConcreteComponent />
                {children}
            </div>
        )
    }
}

Donations.PropTypes = {
    appTypeKey: PropTypes.string.isRequired
}