import React, { Component, PropTypes } from 'react'
import { ROLES } from '../../config/constants.js'
import StudentProfile from '../students/Profile.jsx'
import RegistrarProfile from '../registrar/RegistrarProfile.jsx'
import SuperAdminEdit from '../base/users/superAdmins/SuperAdminEdit.jsx'
import AdminEdit from '../base/users/admins/AdminEdit.jsx'

export default class Profile extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { childTypeKey: null }
        this.childTypes = {
            [ROLES.STUDENT]:     StudentProfile,
            [ROLES.GUEST]:       StudentProfile,
            [ROLES.REGISTRAR]:   RegistrarProfile,
            [ROLES.SUPER_ADMIN]: SuperAdminEdit,
            [ROLES.ADMIN]:       AdminEdit
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

        if (!ConcreteComponent || !this.context.user) return false

        return (
            <div>
                <ConcreteComponent id={this.context.user.id} />
                {children}
            </div>
        )
    }
}

Profile.PropTypes = {
    appTypeKey: PropTypes.string.isRequired
}

Profile.contextTypes = {
   user: PropTypes.object
}