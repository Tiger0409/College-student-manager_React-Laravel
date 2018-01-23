import React from 'react'
import { ROLES } from './../../config/constants.js'
import DebtorsAdmin from './../admin/DebtorsAdmin.jsx'

export default class Courses extends React.Component {
    constructor(props, context) {
        super(props, context)

        this.state = {childTypeKey: null}
        this.childTypes = {
            [ROLES.SUPER_ADMIN]: DebtorsAdmin,
            [ROLES.ADMIN]: DebtorsAdmin
        }
    }

    render() {
        if (this.props.appTypeKey in this.childTypes) {
            var ConcreteComponent = this.childTypes[this.props.appTypeKey]
            var children = this.props.children ?
                React.cloneElement(this.props.children, {appTypeKey: this.props.appTypeKey}) : ''

            return (
                <div>
                    <ConcreteComponent/>
                    {children}
                </div>
            )
        }

        return false
    }
}