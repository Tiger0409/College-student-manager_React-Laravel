import React, { PropTypes, Component } from 'react'
import DataLoader from '../../common/DataLoader.jsx'
import RoleFilter from '../../common/RoleFilter.jsx'
import { ROLES } from '../../../config/constants.js'
import { SettingsForm } from '../../common/FormWidgets.jsx'
import FormGroup from '../../common/FormGroup.jsx'

class SettingsWebsite extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { data: this.props.data }
        this.handleFieldChange = this.handleFieldChange.bind(this)
        this.submit = this.submit.bind(this)
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
        save({settingsInputs: data})
    }

    render() {
        const { data } = this.state

        return (
            <form onSubmit={this.submit}>
                <SettingsForm settings={data} onChange={this.handleFieldChange} />

                <FormGroup>
                    <input className='btn btn-success' type='submit' value='Save' />
                </FormGroup>
            </form>
        )
    }
}

export default RoleFilter(
    DataLoader(
        SettingsWebsite,
        {
            load: {type: 'get', url: '/api/settings/website'},
            save: {type: 'put', url: '/api/settings'}
        }
    ),
    [ROLES.ADMIN, ROLES.SUPER_ADMIN]
)
