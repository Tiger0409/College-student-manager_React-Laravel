import React from 'react'
import { ROLES } from './../../config/constants.js'
import ClassesAdmin from './../admin/ClassesAdmin.jsx'

export default class Courses extends React.Component {
    constructor(props, context) {
        super(props, context)

        this.state = {childTypeKey: null}
        this.childTypes = {
            [ROLES.SUPER_ADMIN]: ClassesAdmin,
            [ROLES.ADMIN]: ClassesAdmin,
            [ROLES.REGISTRAR]: ClassesAdmin
        }
    }

    render() {
        const { appTypeKey } = this.props

        if (appTypeKey in this.childTypes) {
            var ConcreteComponent = this.childTypes[appTypeKey]
            var children = this.props.children ?
                React.cloneElement(this.props.children, { appTypeKey: appTypeKey }) : ''

            return (
                <div>
                    <ConcreteComponent params={this.props.params} />
                    {children}
                </div>
            )
        }

        return false
    }
}