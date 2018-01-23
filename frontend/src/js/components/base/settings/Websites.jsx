import React, { PropTypes, Component } from 'react'
import DataLoader from '../../common/DataLoader.jsx'
import RoleFilter from '../../common/RoleFilter.jsx'
import { ROLES } from '../../../config/constants.js'
import Table from '../../common/Table.jsx'
import FormGroup from '../../common/FormGroup.jsx'
import { Button } from 'react-bootstrap'
import { Link } from 'react-router'
import Notifier from '../../../utils/Notifier.js'

class Websites extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { data: this.props.data, checkedRows: [] }
        this.delete = this.delete.bind(this)
        this.createRow = this.createRow.bind(this)
        this.onRowClick = this.onRowClick.bind(this)
        this.editBranch = this.editBranch.bind(this)
        this.removeBranch = this.removeBranch.bind(this)
    }

    delete() {
        var { checkedRows, data } = this.state
        const { execute } = this.props

        execute(
            'delete',
            { ids: checkedRows },
            () => {
                Notifier.success('Deleted successfully')
                data = data.filter((item) => !checkedRows.includes(item.id.toString()))
                this.setState({ data: data, checkedRows: [] })
            },
            xhr => Notifier.error(xhr.responseText.replace(/"/g, ''))
        )
    }

    onRowClick(e, item) {
        this.context.router.push('/websites/' + item.id)
    }

    editBranch(e, id) {
        e.stopPropagation()
        this.context.router.push('/branches/' + id)
    }

    removeBranch(e, website, branchId) {
        e.stopPropagation()

        var { data } = this.state

        for (let i = 0; i < data.length; i++) {
            if (data[i].id == website.id) {
                let branches = data[i].branchesAssociated
                for (let j = 0; j < branches.length; j++) {
                    if (branches[j].id == branchId) {
                        branches.splice(j, 1)
                        break
                    }
                }

                website = data[i]
                break
            }
        }

        $.ajax({
            type: 'delete',
            url: `/api/websites/${website.id}/branches/${branchId}`,
            success: () => {
                if (this.notifyTimeout) clearTimeout(this.notifyTimeout)
                if (!this.notifyList) this.notifyList = []
                this.notifyList.push(() => Notifier.success('Branch removed successfully', { interval: 0 }))

                this.notifyTimeout = setTimeout(() => {
                    this.notifyList.forEach(item => item())
                    this.notifyList = []
                }, 5000)
            },
            error: xhr => { Notifier.error('Branch` was not removed'); console.log(xhr) }
        })

        this.setState({ data: data })
    }

    createRow(rowObj) {
        const { website } = this.context

        var row = []

        var i = 0
        const pushRow = content => row.push(<td key={i++}>{content}</td>)

        pushRow(
            <p>{rowObj.name} {rowObj.id == website.id ? `[active]` : ''}</p>
        )
        pushRow(
            <ul style={{listStyleType: 'none', padding: '0'}}>
                {
                    rowObj.branchesAssociated.map(
                        (item, i) => (
                            <li key={i} style={{ marginBottom: '5px' }}>
                                <p style={{display: 'inline-block', width: '200px', wordWrap: 'break-word'}}>
                                    {item.branchName}
                                </p>

                                <Button
                                    style={{marginRight: '15px', verticalAlign: 'top'}}
                                    onClick={e => this.editBranch(e, item.id)}
                                >
                                    Edit
                                </Button>

                                <Button
                                    style={{verticalAlign: 'top'}}
                                    onClick={e => this.removeBranch(e, rowObj, item.id)}
                                >
                                    Remove
                                </Button>
                            </li>
                        )
                    )
                }
            </ul>
        )

        return row
    }

    renderTable() {
        const { data } = this.state

        if (!data || data.length === 0) {
            return <p>No websites</p>
        }

        return (
            <Table
                data={data}
                className='table table-striped results-table table-hover'
                headers={['Name', 'Branches']}
                createRow={this.createRow}
                rowStyle={{ cursor: 'pointer' }}
                onRowClick={this.onRowClick}
                checkableRows
                onCheckedRowsChange={checkedRows => this.setState({ checkedRows: checkedRows })}
            />
        )
    }

    render() {
        return (
            <div>
                {this.renderTable()}

                <FormGroup>
                    <Button
                        className='custom btn-success'
                        style={{ marginRight: '15px' }}
                        onClick={() => { this.context.router.push('/websites/add') }}
                    >
                        Add Website
                    </Button>

                    <Button
                        className='custom btn-success'
                        style={{ marginRight: '15px' }}
                        onClick={() => { this.context.router.push('/branches/add') }}
                    >
                        Add Branch
                    </Button>

                    <Button
                        className='custom btn-danger'
                        onClick={this.delete}
                    >
                        Delete
                    </Button>
                </FormGroup>
            </div>
        )
    }
}

Websites.contextTypes = {
    router: PropTypes.object.isRequired,
    website: PropTypes.object.isRequired
}

export default RoleFilter(
    DataLoader(
        Websites,
        {
            load: { type: 'get', url: '/api/websites' },
            delete: { type: 'delete', url: '/api/websites' }
        }
    ),
    [ROLES.ADMIN, ROLES.SUPER_ADMIN]
)
