import React, { PropTypes, Component } from 'react'
import { ROLES } from '../../../config/constants.js'
import SettingsAdmin from '../../admin/SettingsAdmin.jsx'

export default class Settings extends Component {
    constructor(props, context) {
        super(props, context)
        this.headerTypes = {
            [ROLES.SUPER_ADMIN]: SettingsAdmin,
            [ROLES.ADMIN]: SettingsAdmin
        }
    }

    isAllowed() {
        const { appTypeKey } = this.props
        return this.headerTypes.hasOwnProperty(appTypeKey)
    }

    renderChildren() {
        const { children, appTypeKey } = this.props
        if (!children) return false

        return React.cloneElement(children, {appTypeKey: appTypeKey})
    }

    render() {
        if (!this.isAllowed()) return false

        const { appTypeKey } = this.props
        const ConcreteSettings = this.headerTypes[appTypeKey]

        return (
            <div>
                <ConcreteSettings />
                <div id="notifications"></div>
                {this.renderChildren()}
            </div>
        )
    }
}

Settings.PropTypes = {
    appTypeKey: PropTypes.string.isRequired
}