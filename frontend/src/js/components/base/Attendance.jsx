import React from 'react'
import { ROLES } from './../../config/constants.js'
import AttendanceAdmin from './../admin/AttendanceAdmin.jsx'

export default class Courses extends React.Component {
    constructor(props, context) {
        super(props, context)

        this.state = {childTypeKey: null}
        this.childTypes = {
            [ROLES.ADMIN]: AttendanceAdmin
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