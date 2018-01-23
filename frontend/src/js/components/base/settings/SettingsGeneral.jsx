import React, { PropTypes, Component } from 'react'
import { ROLES } from '../../../config/constants.js'
import RoleFilter from '../../common/RoleFilter.jsx'
import DataLoader from '../../common/DataLoader.jsx'
import { SettingsForm } from '../../common/FormWidgets.jsx'
import FormGroup from '../../common/FormGroup.jsx'
import { Button, Row, Col } from 'react-bootstrap'
import HearPlaceSettings from './HearPlacesSettings.jsx'

const allowedRoles = [ROLES.ADMIN, ROLES.SUPER_ADMIN]
const FormEventController = {}

class SettingsGeneral extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { data: this.props.data }
        this.listeners = {}
        this.handleFieldChange = this.handleFieldChange.bind(this)
        this.submit = this.submit.bind(this)
        this.onGetListeners = this.onGetListeners.bind(this)
    }

    handleFieldChange(e) {
        const { name, value } = e.target
        var { data } = this.state

        for (let i in data) {
            if (data[i].settingKey == name) {
                data[i].settingValue = value
                break
            }
        }

        this.setState({data: data})
    }

    submit(e) {
        e.preventDefault()
        const { save } = this.props
        const { data } = this.state
        save({ settingsInputs: data })

        for (let i in this.listeners['submit']) {
            this.listeners['submit'][i]()
        }

        $(FormEventController).trigger('formSave')
    }

    sortByGroups(data) {
        var sorted = {}
        data.forEach(item => {
            let group = item.settingGroup
            if (!sorted.hasOwnProperty(group)) {
                sorted[group] = []
            }

            sorted[group].push(item)
        })

        return sorted
    }

    onGetListeners(listeners) {
        for (let event in listeners) {
            if (!this.listeners[event]) this.listeners[event] = []
            this.listeners[event].push(listeners[event])
        }
    }

    render() {
        const { data } = this.state
        var sorted = this.sortByGroups(data)
        var labelStyle = { fontWeight: 'bold', fontSize: '17px' }

        return (
            <div className='content-block' style={{ paddingTop: '15px' }}>
                <form onSubmit={this.submit}>
                    <Row>
                        <Col md={6}>
                            <h3>General settings</h3>
                            <SettingsForm settings={sorted.general} onChange={this.handleFieldChange} />
                        </Col>

                        <Col md={6}>
                            <h3>Email settings</h3>
                            <SettingsForm settings={sorted.email} onChange={this.handleFieldChange} />
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <h3>Paypal settings</h3>
                            <SettingsForm settings={sorted.paypal} onChange={this.handleFieldChange} />

                            <h3>Stripe settings</h3>
                            <SettingsForm settings={sorted.stripe} onChange={this.handleFieldChange} />
                        </Col>

                        <Col md={6}>
                            <h3>Website settings</h3>
                            <SettingsForm settings={sorted.website} onChange={this.handleFieldChange} />
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <h3>Crafty Clicks postcode api settings</h3>
                            <SettingsForm settings={sorted.postcodeApi} onChange={this.handleFieldChange} />
                        </Col>

                        <Col md={6}>
                            <h3>"Where did you hear about us" settings</h3>
                            <HearPlaceSettings onSendListeners={this.onGetListeners} />
                        </Col>
                    </Row>

                    <FormGroup>
                        <Button className='custom btn-success' type='submit'>Save</Button>
                    </FormGroup>
                </form>
            </div>
        )
    }
}

export default RoleFilter(
    DataLoader(
        SettingsGeneral,
        {
            load: {
                type: 'get',
                url: '/api/settings',
                data: { groups: ['email', 'general', 'paypal', 'website', 'postcodeApi', 'stripe'] }
            },
            save: {type: 'put', url: '/api/settings'}
        }

    ),
    allowedRoles
)