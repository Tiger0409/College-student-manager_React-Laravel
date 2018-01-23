import React, { Component, PropTypes } from 'react'
import CourseHeaderAdmin from './CourseHeaderAdmin.jsx'
import Table from './../common/Table.jsx'
import PromiseHelper from './../../utils/PromiseHelper.js'
import Paginator from './../common/Paginator.jsx'
import { Link } from 'react-router'
import { Button } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import Notifier from '../../utils/Notifier.js'
import ConfirmDeleteWnd from '../common/ConfirmDeleteWnd.jsx'
import Oh from '../../utils/ObjHelper.js'
import Spinner from '../common/Spinner.jsx'

let styles = {
    buttonWrapper: { marginLeft: -5, marginRight: -5 },
    button: { marginLeft: 5, marginRight: 5, marginBottom: 10 }
}

if (window.innerWidth < 768) {
    styles = {
        button: { width: '100%', marginBottom: 10 }
    }
}
export default class DeptsAdmin extends Component {
    render() {
        return (
            <div>
                <CourseHeaderAdmin />
                <div className='content-block'>
                    <h2 className='block-heading'>All Depts</h2>
                    <hr />

                    <div id="notifications"></div>

                    <DeptsTable />
                </div>
            </div>
        )
    }
}

class DeptsTable extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            isLoading: false,
            rows: null,
            totalCount: 0,
            checkedRows: []
        }
        this.rowsPerPage = 20
        this.page = 1
        this.promises = { load: null }
        this.requestFields = [
            'id',
            'deptName',
            'branchIdAssociate',
            'branchAssociated.branchWeight',
            'coursesCount',
            'weight'
        ]
        this.loadData = this.loadData.bind(this)
        this.deleteData = this.deleteData.bind(this)
        this.createRow = this.createRow.bind(this)
        this.createHead = this.createHead.bind(this)
    }

    componentWillMount() {
        this.loadData(this.props, this.context)
    }

    componentWillUnmount() {
        for (let key in this.promises)
            if (this.promises[key]) this.promises[key].cancel()
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (this.context.branchId != nextContext.branchId) {
            this.loadData(nextProps, nextContext)
        }
    }

    render() {
        const { totalCount, showConfirmDelete } = this.state

        return (
            <div>
                {this.renderTable()}
                <Paginator
                    totalCount={totalCount}
                    rowsPerPage={this.rowsPerPage}
                    currentPage={this.page}
                    onPageChange={pageNum => {
                        this.page = pageNum
                        this.loadData()
                    }}/>
                <div style={styles.buttonWrapper}>
                    <Button
                        className='custom'
                        style={styles.button}
                        onClick={() => this.setState({ showConfirmDelete: true })}
                    >
                        Delete selected
                    </Button>

                    <LinkContainer to={{pathname: '/depts/add'}} style={styles.button}>
                        <Button className='custom btn-success'>Add</Button>
                    </LinkContainer>
                </div>

                <ConfirmDeleteWnd
                    show={showConfirmDelete}
                    onConfirm={this.deleteData}
                    onClose={() => this.setState({ showConfirmDelete: false })}
                />
            </div>
        )
    }

    renderTable() {
        const { isLoading, rows } = this.state
        if (isLoading) return (<div><Spinner /></div>)

        return (
            <div>
                <Table
                    data={rows}
                    showingProps={['deptName', 'branchIdAssociate']}
                    headers={['Name', 'Branch']}
                    createHead={this.createHead}
                    createRow={this.createRow}
                    checkableRows={true}
                    onCheckedRowsChange={checkedRows => this.setState({checkedRows: checkedRows})}
                    checkableRowCondition={rowObj => rowObj.coursesCount === 0}
                />
            </div>
        )
    }

    sort(depts) {
        return depts.sort((deptA, deptB) => {
            const branchWeightA = parseInt(Oh.getIfExists(deptA, 'branchAssociated.branchWeight', 0))
            const branchWeightB = parseInt(Oh.getIfExists(deptB, 'branchAssociated.branchWeight', 0))

            if (branchWeightA < branchWeightB) {
                return -1
            } else if (branchWeightA > branchWeightB) {
                return 1
            }

            const weightA = parseInt(deptA.weight)
            const weightB = parseInt(deptB.weight)

            if (weightA < weightB) {
                return -1
            } else {
                return 1
            }
        })
    }

    loadData(props, context) {
        if (!context) {
            context = this.context
        }

        this.setState({isLoading: true})

        var requestParams = {
            rowsPerPage: this.rowsPerPage,
            page: this.page,
            fields: this.requestFields,
            branchId: context.branchId
        }

        if (this.promises.load)
            this.promises.load.cancel()

        this.promises.load = PromiseHelper.ajax({
            type: 'get',
            url: '/api/depts',
            data: requestParams
        })
        this.promises.load.then(
            data => this.setState({ isLoading: false, rows: this.sort(data.rows), totalCount: data.info.totalCount }),
            xhr => console.log(xhr)
        )
    }

    deleteData(reason) {
        var { rows, checkedRows } = this.state
        rows = rows.filter(row => checkedRows.indexOf(row.id.toString()) === -1)
        this.setState({rows: rows, checkedRows: []});

        $.ajax({
            type: 'delete',
            url: '/api/depts',
            data: { ids: checkedRows, reason: reason },
            success: () => Notifier.success('Deleted successfully'),
            error: () => Notifier.error('Deletion failed'),
        })
    }

    createHead(headers) {
        var head = Table.createHeadBase(headers)
        head.push(<td key='controls'></td>)
        return head
    }

    createRow(rowObj, showingProps) {
        var row = Table.createRowBase(rowObj, showingProps)
        row[0] = (<td key='deptName'><Link to={'/courses/dept/' + rowObj.id}>{rowObj.deptName}</Link></td>)
        row.push(<td key='controls'><Link to={'/depts/' + rowObj.id + '/edit'}>Edit</Link></td>)
        return row
    }
}

DeptsTable.contextTypes = {
    branchId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
}