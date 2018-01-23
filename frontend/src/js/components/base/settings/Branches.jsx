import React, { PropTypes, Component } from 'react'
import { ROLES } from '../../../config/constants.js'
import RoleFilter from '../../common/RoleFilter.jsx'
import Table from '../../common/Table.jsx'
import DataLoader from '../../common/DataLoader.jsx'
import FormGroup from '../../common/FormGroup.jsx'
import { Button } from 'react-bootstrap'
import Notifier from '../../../utils/Notifier.js'

class Branches extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { checkedRows: [], data: props.data }
        this.createRow = this.createRow.bind(this)
        this.delete = this.delete.bind(this)
    }

    createRow(rowObj) {
        const { router } = this.context

        let rowData = []
        const push = function () {
            var i = 0;
            return function(item) { rowData.push(<td id={i++}>{item}</td>) }
        }()

        push(rowObj.id)
        push(rowObj.branchName)
        push(
            <Button
                style={{ marginRight: '15px' }}
                onClick={() => { router.push('/branches/' + rowObj.id) }}
            >
                Edit
            </Button>
        )
        return rowData
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

    render() {
        const { data } = this.state

        return (
            <div>
                <div id="notifications"></div>

                <Table
                    data={data}
                    className='table table-striped results-table table-hover'
                    headers={['id', 'Name', '']}
                    createRow={this.createRow}
                    rowStyle={{ cursor: 'pointer' }}
                    onRowClick={this.onRowClick}
                    checkableRows
                    onCheckedRowsChange={checkedRows => this.setState({ checkedRows: checkedRows })}
                />

                <FormGroup>
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
                        Delete Selected
                    </Button>
                </FormGroup>
            </div>
        )
    }
}

Branches.contextTypes = {
    router: PropTypes.object.isRequired
}

export default RoleFilter(
    DataLoader(
        Branches,
        {
            load: { type: 'get', url: '/api/branches-associated' },
            delete: { type: 'delete', url: '/api/branches-associated' }
        }
    ),
    [ROLES.ADMIN, ROLES.SUPER_ADMIN]
)