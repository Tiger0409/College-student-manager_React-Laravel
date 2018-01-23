import React, { PropTypes, Component } from 'react'
import DataLoader from '../../common/DataLoader.jsx'
import RoleFilter from '../../common/RoleFilter.jsx'
import FormGroup from '../../common/FormGroup.jsx'
import { ROLES } from '../../../config/constants.js'
import Table from '../../common/Table.jsx'
import { Link } from 'react-router'
import { Button } from 'react-bootstrap'


class SettingsPages extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { data: this.props.data, checkedRows: [] }
        this.createRow = this.createRow.bind(this)
        this.delete = this.delete.bind(this)
        this.onRowClick = this.onRowClick.bind(this)
    }

    edit(id) {
        this.context.router.push('/pages/' + id + '/edit')
    }

    createRow(rowObj) {
        var row = []

        var i = 0
        const pushRow = (content) => row.push(<td key={i++}>{content}</td>)

        pushRow(
            <p>{rowObj.title}</p>
        )
        pushRow(
            <p>{rowObj.slug}</p>
        )
        pushRow(
            <p>{rowObj.linkPosition}</p>
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
        this.context.router.push('/pages/' + item.id)
    }

    renderTable() {
        const { data } = this.state

        if (!data || data.length === 0) {
            return <p>No pages yet.</p>
        }

        return (
            <Table
                data={data}
                className='table table-striped results-table table-hover'
                headers={['Title', 'Slug', 'Link Position', '']}
                createRow={this.createRow}
                onRowClick={this.onRowClick}
                rowStyle={{ cursor: 'pointer' }}
                checkableRows
                onCheckedRowsChange={checkedRows => this.setState({checkedRows: checkedRows})}
            />
        )
    }

    render() {
        return (
            <div>
                <h2>Pages Management</h2>

                {this.renderTable()}

                <FormGroup>
                    <Button bsStyle='success' style={{marginRight: '15px'}}>
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

SettingsPages.contextTypes = {
    router: PropTypes.object.isRequired
}

export default RoleFilter(
    DataLoader(
        SettingsPages,
        {
            load: { type: 'get', url: '/api/pages' },
            delete: { type: 'delete', url: '/api/pages' }
        }
    ),
    [ROLES.ADMIN, ROLES.SUPER_ADMIN]
)