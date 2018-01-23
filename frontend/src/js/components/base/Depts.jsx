import React, { PropTypes, Component } from 'react'
import { ROLES } from './../../config/constants.js'
import DeptsAdmin from './../admin/DeptsAdmin.jsx'

export default class Depts extends Component {
    constructor(props, context) {
        super(props, context)

        this.state = { childTypeKey: null }
        this.childTypes = {
            [ROLES.SUPER_ADMIN]: DeptsAdmin,
            [ROLES.ADMIN]: DeptsAdmin
        }
    }

    render() {
        if (this.props.appTypeKey in this.childTypes) {
            var ConcreteComponent = this.childTypes[this.props.appTypeKey]
            var children = this.props.children ?
                React.cloneElement(this.props.children, { appTypeKey: this.props.appTypeKey }) : ''

            return (
                <div>
                    <ConcreteComponent />
                    {children}
                </div>
            )
        }

        this.context.router.push('/')
        return false
    }
}

Depts.contextTypes = {
    router: PropTypes.object.isRequired
}