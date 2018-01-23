import React, { PropTypes, Component } from 'react'
import { ROLES } from '../../../config/constants.js'
import FormGroup from '../../common/FormGroup.jsx'
import { FormField, SettingsForm } from '../../common/FormWidgets.jsx'
import PromiseHelper from '../../../utils/PromiseHelper.js'
import StringHelper from '../../../utils/StringHelper.js'
import { Button } from 'react-bootstrap'
import Notifier from '../../../utils/Notifier.js'
import Spinner from '../../common/Spinner.jsx'

export default class SettingsEmail extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { isLoading: false, data: null}
        this.allowedRoles = [ROLES.ADMIN, ROLES.SUPER_ADMIN]
        this.promises = {load: null, save: null}
        this.handleFieldChange = this.handleFieldChange.bind(this)
        this.submit = this.submit.bind(this)
    }

    isAllowed() {
        return this.allowedRoles.includes(this.props.appTypeKey)
    }

    save() {
        if (this.promises.save) {
            this.promises.save.cancel()
        }

        const { data } = this.state

        this.promises.save = PromiseHelper.ajax({
            type: 'put',
            url: '/api/settings',
            data: { settingsInputs: data }
        })
        this.promises.save.then(
            successXhr => {
                Notifier.success('Saved successfully')
                console.log(successXhr)
            },
            errorXhr => {
                Notifier.error('Save failed')
                console.log(errorXhr)
            }
        )
    }

    load() {
        if (this.promises.load) {
            this.promises.load.cancel()
        }

        this.setState({isLoading: true})

        this.promises.load = PromiseHelper.ajax({
            type: 'get',
            url: '/api/settings/email'
        })
        this.promises.load.then(
            data => this.setState({isLoading: false, data: data}),
            xhr => { this.setState({isLoading: false}), console.log(xhr) }
        )
    }

    submit(e) {
        e.preventDefault()
        this.save();
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

    componentWillMount() {
        if (!this.isAllowed()) return
        this.load()
    }

    componentWillUnmount() {
        for (let key in this.promises) {
            if (this.promises[key]) {
                this.promises[key].cancel()
            }
        }
    }

    render() {
        if (!this.isAllowed()) return false

        const { isLoading, data } = this.state

        if (isLoading) return <div><Spinner /></div>

        return (
            <div>
                <form onSubmit={this.submit}>
                    <SettingsForm settings={data} onChange={this.handleFieldChange} />

                    <FormGroup>
                        <Button bsStyle='success' type='submit'>Save</Button>
                    </FormGroup>
                </form>
            </div>
        )
    }
}

SettingsEmail.PropTypes = {
    appTypeKey: PropTypes.string.isRequired
}