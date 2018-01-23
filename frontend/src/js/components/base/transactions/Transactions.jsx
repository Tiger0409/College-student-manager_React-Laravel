import React from 'react'
import TransactionsAdmin from './../../admin/TransactionsAdmin.jsx'
import { ROLES } from './../../../config/constants.js'

export default class Transactions extends React.Component {
    constructor(props, context) {
        super(props, context)

        this.state = {childTypeKey: null}
        this.childTypes = {
            [ROLES.ADMIN]: TransactionsAdmin,
            [ROLES.SUPER_ADMIN]: TransactionsAdmin
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