import React, { PropTypes, Component } from 'react'
import CourseHeaderAdmin from './CourseHeaderAdmin.jsx'
import Table from './../common/Table.jsx'
import PromiseHelper from './../../utils/PromiseHelper.js'
import Paginator from './../common/Paginator.jsx'
import { Link } from 'react-router'
import { Button } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import Notifier from '../../utils/Notifier.js'
import ConfirmDeleteWnd from '../common/ConfirmDeleteWnd.jsx'
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

export default class ClassroomsAdmin extends Component {
    render() {
        return (
            <div>
                <CourseHeaderAdmin />

                <div id="notifications"></div>

                <div className='content-block'>
                    <h2 className='block-heading'>Classrooms</h2>
                    <hr />
                    <ClassroomsTable />
                </div>
            </div>
        )
    }
}

class ClassroomsTable extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            isLoading: false,
            rows: null,
            checkedRows: []
        }
        this.promises = {load: null}
        this.requestFields = [
            'id',
            'classroomName',
            'city.name',
            'branchName'
        ]
        this.deleteData = this.deleteData.bind(this)
    }

    componentWillMount() {
        this.loadData(this.props, this.context)
    }

    componentWillUnmount() {
        for (let key in this.promises)
            if (this.promises[key]) this.promises[key].cancel()
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.loadData(nextProps, nextContext)
    }

    render() {
        const { showConfirmDelete } = this.state

        return (
            <div>
                {this.renderTable()}
                <div style={styles.buttonWrapper}>
                    <Button
                        className='custom'
                        style={styles.button}
                        onClick={() => this.setState({ showConfirmDelete: true })}
                    >
                        Delete selected
                    </Button>

                    <LinkContainer to={{pathname: '/classrooms/add'}} style={styles.button}>
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

        if (rows.length === 0) {
            return <div>No data.</div>
        }

        return (
            <div>
                <Table
                    data={rows}
                    showingProps={['classroomName', 'city.name', 'branchName']}
                    headers={['Classroom name', 'City name', 'Branch Name']}
                    createHead={headers => this.createHead(headers)}
                    createRow={(rowObj, showingProps) => this.createRow(rowObj, showingProps)}
                    checkableRows={true}
                    onCheckedRowsChange={checkedRows => this.setState({checkedRows: checkedRows})}/>
            </div>
        )
    }

    loadData(props, context) {
        this.setState({isLoading: true})

        var requestParams = {
            fields: this.requestFields,
            branchId: context.branchId
        }

        if (this.promises.load)
            this.promises.load.cancel()

        this.promises.load = PromiseHelper.ajax({
            type: 'get',
            url: '/api/classrooms',
            data: requestParams
        })
        this.promises.load.then(
            data => this.setState({isLoading: false, rows: data}),
            xhr => console.log(xhr)
        )
    }

    deleteData(reason) {
        var { rows, checkedRows } = this.state
        rows = rows.filter(row => checkedRows.indexOf(row.id.toString()) === -1)
        this.setState({rows: rows, checkedRows: []});

        $.ajax({
            type: 'delete',
            url: '/api/classrooms',
            data: { ids: checkedRows, reason: reason },
            success: () => Notifier.success('Deleted successfully'),
            error: () => Notifier.success('Deletion failed'),
        })
    }

    createHead(headers) {
        var head = Table.createHeadBase(headers)
        head.push(<td key='controls'></td>)
        return head
    }

    createRow(rowObj, showingProps) {
        var row = Table.createRowBase(rowObj, showingProps)
        row[0] = (<td key='classroomName'><Link to={'/courses/' + rowObj.id}>{rowObj.classroomName}</Link></td>)
        row.push(<td key='controls'><Link to={'/classrooms/' + rowObj.id + '/edit'}>Edit</Link></td>)
        return row
    }
}

ClassroomsTable.contextTypes = {
    branchId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
}