import React, { Component, PropTypes } from 'react'
import RoleFilter from '../../common/RoleFilter'
import { ROLES } from '../../../config/constants.js'
import Ph from '../../../utils/PromiseHelper'
import Table from '../../common/Table'
import Paginator from '../../common/Paginator'
import Spinner from '../../common/Spinner'
import { Button, Row, Col } from 'react-bootstrap'
import { DatePicker } from '../../common/FormWidgets'
import Notifier from '../../../utils/Notifier'
import { Link } from 'react-router'
import SourceSelect from '../../common/SourceSelect'
import SelectField from '../../common/SelectField'
import ConfirmDeleteWnd from '../../common/ConfirmDeleteWnd'
import { Html } from '../../common/FormWidgets'
import ComplaintStat from '../../complaints/ComplaintStat'
import _ from 'lodash'
import moment from 'moment'

export default class ComplaintsList extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            isLoading: false,
            totalCount: 0,
            rows: null,
            stats: null,
            branches: [],
            priorities: [],
            fullDetails: null,
            showFullDetails: false,
            showConfirmDelete: false,
            complaintTypes: [],
            termOptions: [],
            filters: {
                beginDate: '',
                endDate: '',
                orderByDeadline: false,
                isOpenComplaints: 'yes',
                branchId: '',
                termId: '',
                handlerFullname: '',
                priority: '',
                complaintType: '',
                studentName: ''
            },
            checkedRows: []
        }

        this.state.appliedFilters = this.state.filters
        this.applyFilter = _.debounce(this.applyFilter, 1000)

        this.currentPage = 1
        this.rowsPerPage = 40
        this.loadPromise = null
        this.requestFields = [
            'id',
            'types',
            'createdAt',
            'text',
            'handlerFullname',
            'userFullname',
            'actionTaken',
            'actionDeadline',
            'completionDate',
            'users',
            'priority',
            'branchId',
            'branchName',
        ]

        this.createRow = this.createRow.bind(this)
        this.loadData = this.loadData.bind(this)
        this.loadComplaintTypes = this.loadComplaintTypes.bind(this)
        this.handleFilterChange = this.handleFilterChange.bind(this)
        this.deleteRows = this.deleteRows.bind(this)
        this.print = this.print.bind(this)
    }

    createRow(rowData) {
        let rowContent = []

        const push = (() => {
            var i = 0
            return content => rowContent.push(<td key={i++}>{content}</td>)
        })()
        // remove html tags from text
        const truncatedText = _.trunc(rowData.text.replace(/<[^>]*>/g, ''), { length: 200, separator: ' ' })

        // Branch
        push(
            <div style={{ position: 'relative', paddingBottom: 40 }}>
                <div style={{ textTransform: 'capitalize' }}>
                    {rowData.branchName}
                </div>
                <div className='detail-text' style={{
                    position: 'absolute',
                    left: 0,
                    bottom: 0,
                    fontSize: '10px',
                    lineHeight: '12px',
                    width: window.innerWidth < 477 ? 350 : this.refs.complaintTableWrapper.clientWidth * 0.7,
                    whiteSpace: 'normal'
                }}>
                    {truncatedText}
                </div>
            </div>
        )
        // get dates
        new Array('createdAt', 'actionDeadline', 'completionDate').forEach(
            field => { if (rowData[field] && rowData[field].length > 0) rowData[field] = rowData[field].split(' ')[0] }
        )
        // get day left
        let daysLeft = moment(rowData.actionDeadline).diff(Date.now(), 'days')
        daysLeft = daysLeft > 0 ? daysLeft : 0

        // Created/Remaining
        push(<p>{moment(rowData.createdAt).fromNow()} / {daysLeft} left</p>)
        // Student
        push(
            <ul style={{ paddingLeft: '0', listStyle: 'none' }}>
                {rowData.users.map(user => <li><Link to={`/users/${user.id}`}>{user.userFullname}</Link></li>)}
            </ul>
        )
        // Teacher
        push(<p style={{ wordBreak: 'break-all' }}>{rowData.handlerFullname}</p>)
        // Urgency and action buttons
        push(
            <div style={{ wordBreak: 'break-all', textTransform: 'capitalize' }}>
                <p>{rowData.priority}</p>
                <div className='action-button-wrapper' style={{ marginTop: 5, marginLeft: -5, marginRight: -5 }}>
                    <Link to={`/complaints/print/${JSON.stringify(this.state.filters)}`} target='_blank' style={{ color: 'inherit', padding: '0px 5px', borderRight: '1px solid #666666' }}>Print</Link>
                    <a href='javascript:void(0)' style={{ color: 'inherit', padding: '0px 5px' }} onClick={() => this.context.router.push(`/complaints/${rowData.id}`)}>Edit</a>
                </div>
            </div>
        )
        return rowContent
    }

    loadData() {
        this.setState({ isLoading: true })

        var requestParams = {
            page: this.currentPage,
            rowsPerPage: this.rowsPerPage,
            fields: this.requestFields,
            filters: this.state.appliedFilters
        }

        this.loadPromise = Ph.ajax({
            type: 'get',
            url: '/api/complaints',
            data: requestParams
        })
        this.loadPromise.promise.then(
            data => {
                this.setState({
                    isLoading: false,
                    rows: this.manageRowsData(data.rows),
                    totalCount: data.info.totalCount,
                    stats: data.stats
                })
            },
            xhr => {
                this.setState({ isLoading: false })
                console.log(xhr.responseText)
            }
        )
    }

    loadBranchesData () {
        // load branches data
        return Ph.ajax({
            type: 'get',
            url: '/api/branches-associated/list'
        }).promise.then((data) => {
            this.setState({
                branches: data
            })
            return data
        })
    }

    loadTermsData () {
        // load terms data
        return Ph.ajax({
            type: 'get',
            url: '/api/terms/list'
        }).promise.then((data) => {
            this.setState({
                termOptions: data
            })
            return data
        })
    }

    loadPrioritiesData () {
        // load priorities data
        return Ph.ajax({
            type: 'get',
            url: '/api/complaints/priorities'
        }).promise.then((data) => {
            this.setState({
                priorities: data
            })
            return data
        })
    }

    loadActiveTermId () {
        // load active term data
        return Ph.ajax({
            type: 'get',
            url: '/api/terms/active'
        }).promise.then((data) => {
            let { filters } = this.state
            filters.termId = data.id.toString(10)
            this.setState({ filters: filters })
            return data
        })
    }

    manageRowsData (rows) {
        return rows.map((row) => Object.assign({}, row, {
            branchName: row.branchName ? row.branchName : '-'
        }))
    }

    loadComplaintTypes() {
        if (this.complaintTypesLoader) {
            return
        }

        this.complaintTypesLoader = Ph.ajax({
            type: 'get',
            url: '/api/complaints/types'
        })

        this.complaintTypesLoader.then(
            types => {
                this.setState({ complaintTypes: types })
                this.complaintTypesLoader = null
            },
            xhr => {
                Notifier.error(xhr.responseText)
                console.error(xhr)
                this.complaintTypesLoader = null
            }
        )
    }

    handleFilterChange() {
        let { filters } = this.state

        let name, value

        switch (arguments.length) {
            case 1:
                const { target } = arguments[0]
                name = target.name
                value = $(target).attr('type') == 'checkbox' ? target.checked : target.value
                break
            case 2:
                name = arguments[0]
                value = arguments[1]
                break
            default:
                console.error('Error. expected 1 or 2 args in handleFilterChange')
                return
        }

        filters[name] = value
        this.setState({ filters: filters })

        // debounced apply filter
        this.applyFilter()
    }

    applyFilter () {
        this.setState({
            appliedFilters: this.state.filters
        }, this.loadData)
    }

    print() {
        this.context.router.push(`/complaints/print/${JSON.stringify(this.state.filters)}`)
    }

    deleteRows(confirmed, reason) {
        if (!confirmed) {
            this.setState({ showConfirmDelete: true })
            return
        }

        const { checkedRows } = this.state

        $.ajax({
            type: 'delete',
            url: '/api/complaints',
            data: { ids: checkedRows, reason: reason },
            success: () => {
                Notifier.success('Deleted successfully')
                this.setState({ checkedRows: [] })
                this.loadData()
            },
            error: xhr => {
                Notifier.error('Failed to delete')
                console.error(xhr.responseText)
                this.loadData()
            }
        })
    }

    updateDatePickers() {
        DatePicker.init(this.handleFilterChange)
    }

    componentDidUpdate() {
        this.updateDatePickers()
    }

    componentDidMount() {
        this.loadComplaintTypes()
        Promise.all([
            this.loadBranchesData(),
            this.loadTermsData(),
            this.loadPrioritiesData(),
            this.loadActiveTermId()
        ]).then(() => {
            this.loadData()
        })
        this.updateDatePickers()
    }

    renderFilters() {
        const { filters, branches, termOptions, priorities, complaintTypes } = this.state

        return (
            <div style={{ marginBottom: '20px' }}>
                <Row>
                    <Col md={3} style={{ marginBottom: '10px' }}>
                        <SelectField
                            defaultValue=''
                            name='branchId'
                            value={filters.branchId}
                            label='BRANCH'
                            onChange={this.handleFilterChange}
                            hideLabelOnOptionChosen>
                            <option value=''>All</option>
                            {branches.map((branch, index) => (<option value={branch.value} key={index}>{branch.label}</option>))}
                        </SelectField>
                    </Col>
                    <Col md={3} style={{ marginBottom: '10px' }}>
                        <SelectField
                            defaultValue=''
                            name='complaintType'
                            value={filters.complaintType}
                            label='COMPLAINT TYPE'
                            onChange={this.handleFilterChange}
                            hideLabelOnOptionChosen>
                            <option value=''>All</option>
                            {complaintTypes.map((type, index) => <option value={type.value} key={index}>{type.label}</option>)}
                        </SelectField>
                    </Col>
                    <Col md={3} style={{ marginBottom: '10px' }}>
                        <SelectField
                            defaultValue=''
                            name='termId'
                            value={filters.termId}
                            onChange={this.handleFilterChange}
                            hideLabelOnOptionChosen>
                            <option value=''>All Term</option>
                            {termOptions.map((term, index) => (<option value={term.value} key={index}>{term.label}</option>))}
                        </SelectField>
                    </Col>
                </Row>
                <Row>
                    <Col md={2} style={{ marginBottom: '10px' }}>
                        <SelectField
                            name='isOpenComplaints'
                            value={filters.isOpenComplaints}
                            onChange={this.handleFilterChange}
                            hideLabelOnOptionChosen>
                            <option value='yes'>Open</option>
                            <option value='no'>Closed</option>
                        </SelectField>
                    </Col>
                    <Col md={2} style={{ marginBottom: '10px' }}>
                        <input
                            className='form-control datepicker'
                            placeholder='begin date'
                            type="text"
                            id="beginDate"
                            name="beginDate"
                            value={filters.beginDate}
                            onChange={this.handleFilterChange}
                        />
                    </Col>
                    <Col md={2} style={{ marginBottom: '10px' }}>
                        <input
                            className='form-control datepicker'
                            placeholder='end date'
                            type="text"
                            id="endDate"
                            name="endDate"
                            value={filters.endDate}
                            onChange={this.handleFilterChange}
                        />
                    </Col>
                    <Col md={3} style={{ marginBottom: '10px' }}>
                        <SelectField
                            defaultValue=''
                            name='priority'
                            value={filters.priority}
                            label='PRIORITY'
                            onChange={this.handleFilterChange}
                            hideLabelOnOptionChosen>
                            <option value=''>All</option>
                            {priorities.map((branch, index) => (<option value={branch.value} key={index}>{branch.label}</option>))}
                        </SelectField>
                    </Col>
                    <Col md={3} style={{ marginBottom: '10px' }}>
                        <input
                            type='text'
                            name='studentName'
                            placeholder='NAME OF COMPLAINANT'
                            value={filters.studentName}
                            onChange={this.handleFilterChange}
                            className="form-control"
                        />
                    </Col>
                </Row>
            </div>
        )
    }

    renderTable() {
        const { isLoading, rows, showConfirmDelete } = this.state
        if (isLoading) return <Spinner />

        if (!rows || rows.length == 0) {
            return <p>No data</p>
        }

        return (
            <div>
                <Table
                    className='table table-complaints'
                    data={rows}
                    headers={[
                        'Branch',
                        'Created/Remaining',
                        'Student',
                        'Teacher',
                        'Urgency'
                    ]}
                    createRow={this.createRow}
                    onCheckedRowsChange={checkedRows => this.setState({ checkedRows: checkedRows })}
                />

                <ConfirmDeleteWnd
                    show={showConfirmDelete}
                    onConfirm={reason => this.deleteRows(true, reason)}
                    onClose={() => this.setState({ showConfirmDelete: false })}
                />
            </div>

        )
    }

    render() {
        const { totalCount, branches, complaintTypes, stats } = this.state

        return (
            <div className="content-block" ref='complaintTableWrapper'>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <h2 className="block-heading">Complaints List</h2>
                    <Link to='/complaints/add' className='custom btn-gray'>Add Complaint</Link>
                </div>
                <hr/>

                {this.renderFilters()}

                {this.renderTable()}

                <Paginator
                    currentPage={this.currentPage}
                    totalCount={totalCount}
                    rowsPerPage={this.rowsPerPage}
                    onPageChange={pageNum => { this.currentPage = pageNum; this.loadData(); }}
                />

                <ComplaintStat stats={stats} />
            </div>
        )
    }
}

ComplaintsList.contextTypes = {
    router: PropTypes.object.isRequired
}

const Label = ({ style, children }) => (<p style={style} className='detail-field-label'>{children}</p>)
