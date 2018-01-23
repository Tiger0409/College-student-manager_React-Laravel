import React, { PropTypes, Component } from 'react'
import PromiseHelper from '../../../utils/PromiseHelper.js'
import Table from '../../common/Table.jsx'
import { Link } from 'react-router'
import Paginator from '../../common/Paginator.jsx'
import RoleFilter from '../../common/RoleFilter.jsx'
import { ROLES } from '../../../config/constants.js'
import Notifier from '../../../utils/Notifier.js'
import { Button } from 'react-bootstrap'
import Spinner from '../../common/Spinner.jsx'
import ConfirmDeleteWnd from '../../common/ConfirmDeleteWnd.jsx'

class UserReconcile extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { data: null, isLoading: true, totalCount: 0, showConfirmWnd: false, idToDelete: null }
        this.loadPromise = null
        this.rowsPerPage = 40
        this.currentPage = 1
        this.createRow = this.createRow.bind(this)
    }

    componentWillMount() {
        this.load()
    }

    componentWillUnmount() {
        if (this.loadPromise) {
            this.loadPromise.cancel()
        }
    }

    load() {
        if (this.loadPromise) {
            this.loadPromise.cancel()
        }

        var requestParams = {
            rowsPerPage: this.rowsPerPage,
            page: this.currentPage
        }

        this.loadPromise = PromiseHelper.ajax({
            type: 'get',
            url: '/api/users/reconcile',
            data: requestParams
        })
        this.loadPromise.then(
            data => {
                console.log(data)
                this.setState({ isLoading: false, data: data.rows, totalCount: data.info.totalCount })
            },
            xhr => console.log(xhr)
        )
    }

    deleteUser(userId) {
        $.ajax({
            type: 'delete',
            url: `/api/users/${userId}`,
            data: { force: true },
            success: () => Notifier.success('User deleted'),
            error: xhr => { Notifier.error('User deletion failed'), console.error(xhr) }
        })

        let { data } = this.state
        for (let i = 0; i < data.length; i++) {
            if (data[i].id == userId) {
                data.splice(i, 1)
                break
            }
        }

        this.setState({ data: data })
    }


    createRow(rowObj, showingProps) {
        var row = Table.createRowBase(rowObj, showingProps)
        row.push(<td key='controls'><Link to={'/users/' + rowObj.id}>Detail</Link></td>)


        if (rowObj.totalAmount == 0) {
            row.push(
                <td key='delete'>
                    <Button
                        onClick={() => this.setState({ showConfirmWnd: true, idToDelete: rowObj.id })}
                    >
                        Delete User + Class
                    </Button>
                </td>
            )
        }
        return row
    }

    renderTable() {
        const { isLoading, data } = this.state

        if (isLoading)
            return (
                <div>
                    <div><Spinner /></div>
                </div>
            )

        if (!data || data.length == 0)
            return (
                <div>
                    <p>No data.</p>
                </div>
            )

        return (
            <Table
                data={data}
                showingProps={['profileForname', 'profileSurname', 'profileAddress', 'profilePostcode', 'classesCount']}
                headers={['First Name', 'Last Name', 'Address', 'Post Code', 'Classes Enrolled', 'View Profile', '']}
                createRow={this.createRow}
            />
        )
    }

    renderPaginator() {
        return (
            <Paginator
                totalCount={this.state.totalCount}
                rowsPerPage={this.rowsPerPage}
                currentPage={this.currentPage}
                onPageChange={pageNum => {
                    this.currentPage = pageNum
                    this.setState({isLoading: true})
                    this.load()
                }}/>
        )
    }

    render() {
        const { showConfirmWnd, idToDelete } = this.state

        return (
            <div>
                <div id="notifications"></div>
                <div className='content-block' style={{ paddingTop: '35px' }}>
                    {this.renderTable()}
                    {this.renderPaginator()}
                </div>

                <ConfirmDeleteWnd
                    show={showConfirmWnd}
                    onConfirm={() => this.deleteUser(idToDelete)}
                    onClose={() => this.setState({ showConfirmWnd: false })}
                />
            </div>
        )
    }
}

export default RoleFilter(UserReconcile, [ROLES.ADMIN, ROLES.SUPER_ADMIN])