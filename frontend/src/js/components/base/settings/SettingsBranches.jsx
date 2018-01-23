import React, { PropTypes, Component } from 'react'
import DataLoader from '../../common/DataLoader.jsx'
import RoleFilter from '../../common/RoleFilter.jsx'
import FormGroup from '../../common/FormGroup.jsx'
import { ROLES } from '../../../config/constants.js'
import Table from '../../common/Table.jsx'
import { Link } from 'react-router'
import { Button } from 'react-bootstrap'


class SettingsBranches extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { data: this.props.data, checkedRows: [] }
        this.createRow = this.createRow.bind(this)
        this.delete = this.delete.bind(this)
        this.onRowClick = this.onRowClick.bind(this)
    }

    edit(id) {
        this.context.types.push('/branches/' + id + '/edit')
    }

    createRow(rowObj) {
        var row = []

        var i = 0
        const pushRow = (content) => row.push(<td key={i++}>{content}</td>)

        pushRow(
            <div>
                <p>{rowObj.name}</p>
                <ul style={{listStyleType: 'none'}}>
                    {
                        rowObj.branchesAssociated.map(
                            (item, i) => (
                                <li key={i}>
                                    <p style={{display: 'inline-block', width: '200px', wordWrap: 'break-word'}}>
                                        {item.branchName}
                                    </p>
                                    <Button style={{marginRight: '15px'}}>Edit</Button>
                                    <Button>Remove</Button>
                                </li>
                            )
                        )
                    }
                </ul>
            </div>
        )
        pushRow(
            <Button onClick={() => this.edit(rowObj.id)}>Edit</Button>
        )

        return row
    }

    delete() {
        var { checkedRows, data } = this.state
        const { execute } = this.props

        execute('delete', { ids: checkedRows })
        data = data.filter(item => !checkedRows.includes(item.id.toString()))

        this.setState({ data: data, checkedRows: [] })
    }

    onRowClick(e, item) {
        this.context.router.push('/branches/' + item.id)
    }

    renderTable() {
        const { data } = this.state

        if (!data || data.length === 0) {
            return <p>No cities yet.</p>
        }

        return (
            <Table
                data={data}
                className='table table-striped results-table table-hover'
                headers={['City Name', '']}
                createRow={this.createRow}
                onRowClick={this.onRowClick}
                rowStyle={{ cursor: 'pointer' }}
                checkableRows
                onCheckedRowsChange={checkedRows => this.setState({ checkedRows: checkedRows })}
            />
        )
    }

    render() {
        return (
            <div>
                <h2>Cities Management</h2>

                {this.renderTable()}

                <FormGroup>
                    <Button bsStyle='success' style={{ marginRight: '15px' }}>
                        Add
                    </Button>
                    <Button onClick={this.delete}>
                        Delete
                    </Button>
                </FormGroup>
            </div>
        )
    }
}

SettingsBranches.contextTypes = {
    router: PropTypes.object.isRequired
}

export default RoleFilter(
    DataLoader(
        SettingsBranches,
        {
            load: {
                type: 'get',
                url: '/api/branches',
                data: { fields: ['id', 'name', 'branchesAssociated'] }
            },
            delete: { type: 'delete', url: '/api/branches' }
        }
    ),
    [ROLES.ADMIN, ROLES.SUPER_ADMIN]
)