import React, { PropTypes, Component } from 'react'
import Auth from './../../utils/Auth.js'
import { ROLES } from './../../config/constants.js'
import AppStudent from '../students/AppStudent.jsx'

export default class Home extends React.Component {
    constructor(props, context) {
        super(props, context)

        var redirectUrl = ''
        switch (props.appTypeKey) {
            case ROLES.REGISTRAR:
            case ROLES.SUPER_ADMIN:
            case ROLES.ADMIN:
                redirectUrl = '/dashboard'
                break
            case ROLES.STUDENT:
            case ROLES.GUEST:
                redirectUrl = AppStudent.getTemplatedComponent('Home', { userRole: props.appTypeKey })
                break
        }

        if (redirectUrl.endsWith('.html') || !this.context) {
            window.location.assign(redirectUrl)
        } else {
            this.context.router.replace(redirectUrl)
        }
    }

    render() {
        return (
            <div>
            </div>
        )
    }
}

Home.contextTypes = {
    router: PropTypes.object.isRequired
}