import React, { PropTypes, Component } from 'react'
import DataLoader from '../../common/DataLoader.jsx'
import RoleFilter from '../../common/RoleFilter.jsx'
import { ROLES } from '../../../config/constants.js'
import { Button } from 'react-bootstrap'
import FormGroup from '../../common/FormGroup.jsx'

class SettingsBank extends Component {
    constructor(props, context) {
        super(props, context)
        const { data, execute } = props
        this.state = { data: data, feedbackCodes: [] }
        this.add = this.add.bind(this)
        this.save = this.save.bind(this)
        this.cancel = this.cancel.bind(this)
        this.delete = this.delete.bind(this)
        this.onRowChange = this.onRowChange.bind(this)

        execute('getLevelOptions', {}, resultData => 
            this.setState({ feedbackCodes: resultData })
        )        
    }

    add() {
        var { data } = this.state
        data.push({ description: '', feedbackCode: 1 })
        this.setState({ data: data })
    }

    save() {
        const { data } = this.state
        const { save, load } = this.props
        save({ data: data }, () => {
            load()
        })
    }

    cancel() {
        this.props.load()
    }

    delete(i) {
        var { data } = this.state
        const item = data[i]
        if (!item) return

        if (item.id) {
            item.isDeleted = true
        } else {
            data.splice(i, 1)
        }

        this.setState({ data: data })
    }

    onRowChange(e, i) {
        var { data } = this.state
        const { name, value } = e.target
        if (data[i]) {
            data[i][name] = value
        }
        this.setState({ data: data })
    }

    getItemsCount() {
        const { data } = this.state
        if (!data) return 0

        var count = 0
        data.forEach(item => {
            if (!item.isDeleted) count++
        })

        return count
    }

    componentWillReceiveProps(newProps) {
        this.setState({ data: newProps.data })
    }

    renderTable() {
        const { data, feedbackCodes } = this.state

        if (this.getItemsCount() === 0) {
            return <p>No feedbacks yet</p>
        }

        return (
            <div className='table-responsive'>
                <table className='table table-striped results-table' style={{ minWidth: 500 }}>
                    <thead>
                    <tr>
                        <td>Description</td>
                        <td>Level</td>
                        <td></td>
                        <td></td>
                    </tr>
                    </thead>

                    <tbody>
                    {
                        data.map(
                            (item, i) => {
                                if (item.isDeleted) {
                                    return false
                                }

                                return (
                                    <tr key={i}>
                                        <td>
                                            <input
                                                name='feedbackDescription'
                                                className='form-control'
                                                type='text'
                                                value={item.feedbackDescription}
                                                onClick={e => e.preventDefault()}
                                                onChange={e => this.onRowChange(e, i)}
                                            />
                                        </td>
                                        <td>
                                            <select
                                                name='feedbackCode'
                                                className='form-control'
                                                value={item.feedbackCode}
                                                onClick={e => e.preventDefault()}
                                                onChange={e => this.onRowChange(e, i)}
                                            >
                                                {
                                                    feedbackCodes.map((code, i) => (
                                                        <option key={i} value={code.value}>{code.label}</option>
                                                    ))
                                                }
                                            </select>
                                        </td>
                                        <td>
                                            <Button
                                                className='custom'
                                                onClick={e => {
                                                    e.preventDefault()
                                                    this.delete(i)
                                                }}
                                                style={{ width: '100%' }}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                )
                            }
                        )
                    }
                    </tbody>
                </table>
            </div>
        )
    }

    render() {
        return (
            <div className='content-block' style={{ paddingTop: '35px' }}>
                {this.renderTable()}

                <FormGroup>
                    <Button
                        className='custom btn-success'
                        onClick={this.add}
                        style={{ marginRight: '15px' }}
                    >
                        Add
                    </Button>

                    <Button
                        className='custom btn-success'
                        onClick={this.save}
                        style={{ marginRight: '15px' }}
                    >
                        Save
                    </Button>

                    <Button className='custom' onClick={this.cancel}>Cancel</Button>
                </FormGroup>
            </div>
        )
    }
}

export default RoleFilter(
    DataLoader(
        SettingsBank,
        {
            load: {type: 'get', url: '/api/bank'},
            save: {type: 'put', url: '/api/bank'},
            getLevelOptions: {type: 'get', url: '/api/lookup/get-feedback-level'}
        }
    ),
    [ROLES.ADMIN, ROLES.SUPER_ADMIN]
)