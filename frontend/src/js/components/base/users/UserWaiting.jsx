import React, { PropTypes, Component } from 'react'
import Table from '../../common/Table.jsx'
import { Link } from 'react-router'
import { Button, Row, Col } from 'react-bootstrap'
import Paginator from '../../common/Paginator.jsx'
import RoleFilter from '../../common/RoleFilter.jsx'
import { ROLES } from '../../../config/constants.js'
import Ph from '../../../utils/PromiseHelper.js'
import Spinner from '../../common/Spinner.jsx'
import { DatePicker } from '../../common/FormWidgets'

const FILTER_OPTIONS = {
    NO_CLASSES_THIS_TERM: 'noClassesThisTerm',
    NO_CLASSES_ALL_AND_THIS_TERM: 'noClassesAllAndThisTerm',
    NO_CLASSES_ALL_TERMS: 'noClassesInAllTerms',
    MARKED_AS_WAITING   : 'statusIsWaiting'
}

let styles = {
    datePicker: { alignSelf: 'center', width: '200px' }
}

if (window.innerWidth < 768) {
    styles = {
        datePicker: { width: '100%' }
    }
}

class UserWaiting extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            data: null,
            isLoading: true,
            totalCount: 0,
            filter: FILTER_OPTIONS.NO_CLASSES_ALL_TERMS,
            beginDate: null,
            endDate: null,
            uniqueUsersCount: null
        }
        this.loadPromise = null
        this.rowsPerPage = 40
        this.currentPage = 1
        this.createRow = this.createRow.bind(this)
        this.load = this.load.bind(this)
        this.handleFieldChange = this.handleFieldChange.bind(this)
    }

    handleFieldChange() {
        let name, value

        switch (arguments.length) {
            case 1:
                name = arguments[0].target.name
                value = arguments[0].target.value
                break

            case 2:
                name = arguments[0]
                value = arguments[1]
        }

        this.setState({ [name]: value })
    }

    componentWillMount() {
        this.load()
    }

    componentDidMount() {
        DatePicker.init(this.handleFieldChange)
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

        const { filter, beginDate, endDate } = this.state

        var requestParams = {
            rowsPerPage: this.rowsPerPage,
            page: this.currentPage,
            waitingFilter: filter,
            beginDate: beginDate,
            endDate: endDate,
            advancedSearch: true
        }

        this.loadPromise = Ph.ajax({
            type: 'get',
            url: '/api/users/search/students',
            data: requestParams
        })
        this.loadPromise.then(
            data => {
                this.setState({ isLoading: false, data: data.rows, totalCount: data.info.totalCount })
            },
            xhr => console.log(xhr)
        )

        this.uniqueUsersCountPromise = Ph.ajax({
            type: 'get',
            url: `/api/users/search/students`,
            data: { waitingFilter: filter, countOnly: true }
        })
        this.uniqueUsersCountPromise.then(
            count => this.setState({ uniqueUsersCount: count }),
            xhr => console.error(xhr)
        )
    }

    createRow(rowObj, showingProps) {
        var row = Table.createRowBase(rowObj, showingProps, true)
        row.push(<td key='updatedAt'>{rowObj.userStatusUpdatedAt.split(' ')[0]}</td>)
        row.push(<td key='controls'><Link to={'/users/' + rowObj.profileId}>Detail</Link></td>)
        return row
    }

    renderFilter() {
        const { filter, beginDate, endDate } = this.state

        const Label = ({ style, children }) => (<p style={style} className='detail-field-label'>{children}</p>)

        return (
            <div style={{ marginTop: '20px' }}>
                <Row>
                    <Col md={5}>
                        <div style={{ marginBottom: 15 }}>
                            <input
                                type='radio'
                                checked={filter == FILTER_OPTIONS.NO_CLASSES_ALL_TERMS}
                                onChange={e => this.setState({ filter: FILTER_OPTIONS.NO_CLASSES_ALL_TERMS })}
                                style={{ verticalAlign: 'middle' }}
                            />
                            <span style={{ verticalAlign: 'top' }}>Show with no classes in all terms</span>
                        </div>

                        <div style={{ marginBottom: 15 }}>
                            <input
                                type='radio'
                                checked={filter == FILTER_OPTIONS.NO_CLASSES_THIS_TERM}
                                onChange={e => this.setState({ filter: FILTER_OPTIONS.NO_CLASSES_THIS_TERM })}
                                style={{ verticalAlign: 'middle' }}
                            />
                            <span style={{ verticalAlign: 'top' }}>Show with no classes in this term</span>
                        </div>

                        <div style={{ marginBottom: 15 }}>
                            <input
                                type='radio'
                                checked={filter == FILTER_OPTIONS.NO_CLASSES_ALL_AND_THIS_TERM}
                                onChange={e => this.setState({ filter: FILTER_OPTIONS.NO_CLASSES_ALL_AND_THIS_TERM })}
                                style={{ verticalAlign: 'middle' }}
                            />
                            <span style={{ verticalAlign: 'top' }}>{'Show with no classes in this term & 0 classes'}</span>
                        </div>

                        <div style={{ marginBottom: 15 }}>
                            <input
                                type='radio'
                                checked={filter == FILTER_OPTIONS.MARKED_AS_WAITING}
                                onChange={e => this.setState({ filter: FILTER_OPTIONS.MARKED_AS_WAITING })}
                                style={{ verticalAlign: 'middle' }}
                            />
                            <span style={{ verticalAlign: 'top' }}>Show marked as "waiting"</span>
                        </div>
                    </Col>

                    <Col md={6}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px', flexWrap: 'wrap' }}>
                            <input
                                className="form-control datepicker"
                                placeholder='begin date'
                                type="text"
                                id="beginDate"
                                name="beginDate"
                                value={beginDate}
                                onChange={this.handleFieldChange}
                                style={styles.datePicker}
                            />

                            <Label style={{ alignSelf: 'center', margin: '10px 20px 10px 20px' }}>Until</Label>

                            <input
                                className="form-control datepicker"
                                placeholder='end date'
                                type="text"
                                id="endDate"
                                name="endDate"
                                value={endDate}
                                onChange={this.handleFieldChange}
                                style={styles.datePicker}
                            />
                        </div>
                    </Col>
                </Row>

                <div>
                    <Button
                        className='custom btn-success'
                        style={{ marginTop: '15px', marginBottom: 10 }}
                        onClick={this.load}
                    >
                        Filter
                    </Button>
                </div>
            </div>
        )
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
            <div style={{ margin: '20px auto' }}>
                <Table
                    data={data}
                    showingProps={['fullName', 'emailAddress', 'closestBranches']}
                    headers={['Full name', 'Email Address', 'Closest Branches', 'Waiting sinse', '']}
                    createRow={this.createRow}
                />

                {this.renderExports()}
            </div>
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
                    this.setState({ isLoading: true })
                    this.load()
                }}
            />
        )
    }

    renderExports() {
        const { filter, uniqueUsersCount } = this.state
        const filtersJson = JSON.stringify({
            waitingFilter: filter
        })

        return (
            <div>
                <Row style={{ fontSize: '12pt' }}>
                    <Col md={4} mdOffset={1} sm={6} smOffset={6} style={{ textAlign: window.innerWidth < 768 ? 'left' : 'right', marginBottom: 10 }}>
                        <Link
                            to={`/users/students/print/addresses/filters/${filtersJson}`}
                            target='_blank'
                            style={{ color: '#f0a300' }}
                            >
                            {'Export Addresses' + (uniqueUsersCount ? ` - ${uniqueUsersCount} unique users` : '')}
                        </Link>
                    </Col>

                    <Col md={2} className='hidden-xs' style={{ textAlign: 'center' }}>|</Col>

                    <Col md={4} sm={6} style={{ textAlign: 'left', marginBottom: 10 }}>
                        <Link
                            to={`/users/students/print/addresses-xls/filters/${filtersJson}`}
                            target='_blank'
                            style={{ color: '#f0a300' }}
                            >
                            {'Export Addresses XLS' + (uniqueUsersCount ? ` - ${uniqueUsersCount} unique users` : '')}
                        </Link>
                    </Col>
                </Row>

                <Row>
                    <Col md={10} mdOffset={1} style={{ textAlign: 'center', paddingLeft: '30px' }}>
                        <ExportBtn
                            url={`/users/students/print/numbers/filters/${filtersJson}`}
                            label='Export Numbers'
                        />

                        <ExportBtn
                            url={`/users/students/print/emails/filters/${filtersJson}`}
                            label='Export Emails'
                        />

                        <ExportBtn
                            url={`/users/students/print/grades-table/filters/${filtersJson}`}
                            label='Export Grades'
                        />

                        <ExportBtn
                            url={`/users/students/print/grades/filters/${filtersJson}`}
                            label='Export Grades Print'
                        />
                    </Col>
                </Row>

                <Row>
                    <Col mdOffset={1} md={10} style={{ textAlign: 'center', paddingLeft: '30px' }}>
                        <ExportBtn
                            url={`/users/students/print/details/filters/${filtersJson}`}
                            label='Export List of Details'
                        />

                        <ExportBtn
                            url={`/users/students/print/transactions/filters/${filtersJson}`}
                            label='Export Transactions'
                        />

                        <ExportBtn
                            url={`/users/students/print/card/filters/${filtersJson}`}
                            label='Export Card'
                        />

                        <ExportBtn
                            url={`/users/students/print/class-details/filters/${filtersJson}`}
                            label='Export Class Details'
                        />
                    </Col>
                </Row>
            </div>
        )
    }

    render() {
        return (
            <div>
                <div className='content-block' style={{ marginTop: '35px' }}>
                    {this.renderFilter()}
                </div>

                <div className='content-block' style={{ marginTop: '35px' }}>
                    {this.renderTable()}
                    {this.renderPaginator()}
                </div>
            </div>
        )
    }
}

export default RoleFilter(UserWaiting, [ROLES.ADMIN, ROLES.SUPER_ADMIN])

class ExportBtn extends Component {
    constructor(props, context) {
        super(props, context)
        this.buttonOffset = { marginRight: '15px', marginTop: '15px', display: 'inline-block' }
    }

    loadUniqueUsersCount() {
        let urlParts = []
        let temp = this.props.url.split('/')
        for (let i in temp) {
            temp[i] && urlParts.push(temp[i])
        }

        const role    = urlParts[1]
        const type    = urlParts[3]
        let filters   = urlParts[5]

        if (!filters) return

        filters = JSON.parse(filters)
        filters.countOnly = true

        this.promise = Ph.ajax({
            type: 'get',
            url: `/api/users/search/${role}`,
            data: filters
        })
        this.promise.then(
            count => this.setState({ label: `${this.state.label} - ${count} unique users`})
        )
    }

    componentWillUnmount() {
        if (this.promise) this.promise.cancel()
    }

    componentDidMount() {
        //this.loadUniqueUsersCount()
    }

    render() {
        const { url, label } = this.props

        return (
            <Link
                to={url}
                target='_blank'
                style={this.buttonOffset}
            >
                <Button style={{ width: '190px' }} className='custom'>{label}</Button>
            </Link>
        )
    }
}