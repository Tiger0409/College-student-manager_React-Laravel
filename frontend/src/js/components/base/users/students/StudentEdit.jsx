import React from 'react'
import { ROLES } from './../../../../config/constants.js'

export default class StudentEdit extends React.Component {
    static allowedRoles() {
        return [ROLES.ADMIN]
    }

    constructor(props, context) {
        super(props, context)
    }

    render() {
        return <p> Not implemented yet</p>
    }
}