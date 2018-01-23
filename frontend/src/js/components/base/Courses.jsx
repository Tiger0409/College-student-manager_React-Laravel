import React from 'react'
import { ROLES } from './../../config/constants.js'
import CoursesAdmin from './../admin/CoursesAdmin.jsx'
import MyCourses from '../students/MyCourses.jsx'

export default class Courses extends React.Component {
    constructor(props, context) {
        super(props, context)

        this.state = {childTypeKey: null}
        this.childTypes = {
            [ROLES.SUPER_ADMIN]: CoursesAdmin,
            [ROLES.ADMIN]: CoursesAdmin,
            [ROLES.REGISTRAR]: CoursesAdmin,
            [ROLES.STUDENT]: MyCourses
        }
    }

    render() {
        if (this.props.appTypeKey in this.childTypes) {
            var ConcreteComponent = this.childTypes[this.props.appTypeKey]
            var children = this.props.children ?
                React.cloneElement(this.props.children, {appTypeKey: this.props.appTypeKey}) : ''

            return (
                <div>
                    <ConcreteComponent params={this.props.params}/>
                    {children}
                </div>
            )
        }

        console.error('Access denied for courses')

        return false
    }
}