import React, { PropTypes, Component } from 'react'
import { ROLES } from '../../../config/constants.js'
import RoleFilter from '../../common/RoleFilter.jsx'
import DataLoader from '../../common/DataLoader.jsx'
import { SettingsForm } from '../../common/FormWidgets.jsx'
import FormGroup from '../../common/FormGroup.jsx'
import { Button } from 'react-bootstrap'

const allowedRoles = [ROLES.ADMIN, ROLES.SUPER_ADMIN]
const FormEventController = {}

class SettingsPaypal extends Component {
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

        $(FormEventController).trigger('formSave')
    }

    render() {
        const { data } = this.state

        return (
            <form onSubmit={this.submit}>
                <SettingsForm settings={data} onChange={this.handleFieldChange} />

                <FormGroup>
                    <Button bsStyle='success' type='submit'>Save</Button>
                </FormGroup>
            </form>
        )
    }
}

const Instalments = DataLoader(
    class extends Component {
        constructor(props, context) {
            super(props, context)
            this.state = { data: props.data }
            this.delete = this.delete.bind(this)
            this.add = this.add.bind(this)
            this.handleRowChange = this.handleRowChange.bind(this)
            this.renderRow = this.renderRow.bind(this)
        }

        componentWillMount() {
            $(FormEventController).on('formSave', () => {
                const { save, load } = this.props
                const { data } = this.state
                save({ data: data }, () => load())
            })
        }

        componentWillUnmount() {
            $(FormEventController).off('formSave')
        }

        componentWillReceiveProps(newProps) {
            if (newProps.data) {
                this.setState({data: newProps.data})
            }
        }

        delete(index) {
            var { data } = this.state
            if (!data[index]) return

            if (data[index].id) {
                data[index].isDeleted = true
            } else {
                data.splice(index, 1)
            }
            this.setState({data: data})
        }

        add() {
            var { data } = this.state
            const dateNow = new Date().toISOString().slice(0, 10)
            data.push({name: '', amount: 0, duedate: dateNow})
            this.setState({data: data})
        }

        getItemsCount() {
            const { data } = this.state
            if (!data) return 0

            var count = 0
            for (let i in data) {
                if (!data[i].isDeleted) {
                    count++
                }
            }
            return count
        }

        handleRowChange(e, index) {
            var { data } = this.state
            const { name, value } = e.target
            if (!data[index]) return

            data[index][name] = value
            this.setState({data: data})
        }

        renderRow(item, key) {
            if (item.isDeleted) return false

            return (
                <tr key={key}>
                    <td>
                        <input
                            className='form-control'
                            type='text'
                            name='name'
                            value={item.name}
                            onChange={e => this.handleRowChange(e, key)}
                        />
                    </td>
                    <td>
                        <input
                            className='form-control'
                            type='text'
                            name='amount'
                            value={item.amount}
                            onChange={e => this.handleRowChange(e, key)}
                        />
                    </td>
                    <td>
                        <input
                            className='form-control'
                            type='date'
                            name='duedate'
                            value={item.duedate}
                            onChange={e => this.handleRowChange(e, key)}
                        />
                    </td>
                    <td>
                        <Button
                            style={{width: '100%'}}
                            onClick={() => this.delete(key)}
                        >
                            Delete
                        </Button>
                    </td>
                </tr>
            )
        }

        renderTable() {
            const { data } = this.state

            if (this.getItemsCount() === 0) {
                return false
            }

            return (
                <table className='table table-striped results-table'>
                    <thead>
                        <tr>
                            <td>Name</td>
                            <td>Amount</td>
                            <td>Duedate</td>
                            <td></td>
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((item, i) => this.renderRow(item, i))}
                    </tbody>
                </table>
            )
        }

        render() {
            return (
                <div>
                    <p style={{fontWeight: 'bold'}}>Instalments</p>
                    {this.renderTable()}
                    <FormGroup>
                        <Button onClick={this.add}>Add</Button>
                    </FormGroup>
                </div>
            )
        }
    },
    {
        load: {type: 'get', url: '/api/instalments'},
        save: {type: 'put', url: '/api/instalments'}
    }
)

export default RoleFilter(
    DataLoader(
        SettingsPaypal,
        {
            load: {type: 'get', url: '/api/settings/paypal'},
            save: {type: 'put', url: '/api/settings'}
        }

    ),
    allowedRoles
)