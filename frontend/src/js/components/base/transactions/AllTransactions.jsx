import React, { PropTypes, Component } from 'react'
import { ROLES } from '../../../config/constants.js'
import { Button, Row, Col } from 'react-bootstrap'
import FormGroup from './../../common/FormGroup.jsx'
import SourceSelect from './../../common/SourceSelect.jsx'
import PromiseHelper from './../../../utils/PromiseHelper.js'
import Table from './../../common/Table.jsx'
import Paginator from './../../common/Paginator.jsx'
import { Link } from 'react-router'
import Spinner from '../../common/Spinner.jsx'
import { DatePicker } from '../../common/FormWidgets.jsx'
import Oh from '../../../utils/ObjHelper'

const get = Oh.getIfExists

let styles = {
    filterDatePicker: { alignSelf: 'center', width: 200 },
    untilLabel: { alignSelf: 'center', margin: '10px 20px 10px 20px' },
    filterButton: { marginTop: '50px' }
}

if (window.innerWidth < 768) {
    styles = {
        filterDatePicker: { flexBasis: '100%', marginBottom: 10 },
        untilLabel: { alignSelf: 'center', margin: '0px 20px 10px 20px' },
        filterButton: { marginTop: '50px', width: '100%' }
    }
}

export default class AllTransactions extends React.Component {
    constructor(props, context) {
        super(props, context)
        this.state = { filters: null }
    }

    render() {
        if (!this.props.appTypeKey || !AllTransactions.allowedRoles().includes(this.props.appTypeKey))
            return false

        const { filters } = this.state

        return (
            <div>
                <div className='content-block'>
                    <FilterForm onFiltersSubmit={filters => this.setState({ filters: filters })} />
                </div>

                <TransactionTable filters={filters} />
            </div>
        )
    }

    static allowedRoles() {
        return [ROLES.ADMIN, ROLES.SUPER_ADMIN]
    }
}

class Exports extends Component {
    render() {
        const { filters } = this.props


        const filtersJson = filters ? JSON.stringify(filters) : ''
        
        return (
            <div style={{ marginBottom: '15px' }}>
                <Link
                    to={`/transactions/print/students/filters/${filtersJson}`}
                    target='_blank'
                >
                    <Button className='custom'>Export Transactions</Button>
                </Link>

                <Link
                    style={{ marginLeft: '15px' }}
                    to={`/transactions/print/cart-items/filters/${filtersJson}`}
                    target='_blank'
                >
                    <Button className='custom'>Export student with cart items</Button>
                </Link>
            </div>
        )
    }
}

Exports.propTypes = {
    filters: PropTypes.object
}

class FilterForm extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            filters: {
                paymentMethod: 'All',
                paymentStatus: 'All',
                regStatus: 'All',
                employmentType: 'All',
                paymentType: 'All',
                beginDate: '',
                endDate: '',
                currTermOnly: false,
                haveAdminNotes: false,
                haveReducedNotes: false
            }
        }
        
        this.submit = this.submit.bind(this)
        this.handleFieldChange = this.handleFieldChange.bind(this)
        this.updateFilter = this.updateFilter.bind(this)
    }

    componentDidMount() {
        DatePicker.init(this.updateFilter)
    }

    updateFilter(name, value) {
        let { filters } = this.state
        filters[name] = value
        this.setState({ filters: filters })
    }

    render() {
        const Label = ({ style, children }) => (<p style={style} className='detail-field-label'>{children}</p>)

        return (
            <div>
                <form id='filterForm' onSubmit={this.submit} style={{ marginTop: '35px' }}>
                    <Row>
                        <Col md={5} mdOffset={1}>
                            <FormGroup>
                                <Label>Payment method</Label>
                                <SourceSelect
                                    url='/api/students/get-reg-payment-method-enum'
                                    className="form-control"
                                    name="paymentMethod"
                                    id="paymentMethod"
                                    value={this.state.filters.paymentMethod}
                                    onChange={this.handleFieldChange}>
                                    <option value='All'>All Methods</option>
                                </SourceSelect>
                            </FormGroup>
                        </Col>

                        <Col md={5}>
                            <FormGroup>
                                <Label>Payment Status</Label>
                                <SourceSelect
                                    url='/api/students/get-reg-payment-status-enum'
                                    className="form-control"
                                    name="paymentStatus"
                                    id="paymentStatus"
                                    value={this.state.filters.paymentStatus}
                                    onChange={this.handleFieldChange}>
                                    <option value='All'>All Statuses</option>
                                </SourceSelect>
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={5} mdOffset={1}>
                            <FormGroup>
                                <Label>Registration Status</Label>
                                <SourceSelect
                                    url='/api/students/get-reg-status-enum'
                                    className="form-control"
                                    name="regStatus"
                                    id="regStatus"
                                    value={this.state.filters.regStatus}
                                    onChange={this.handleFieldChange}>
                                    <option value='All'>All Statuses</option>
                                </SourceSelect>
                            </FormGroup>
                        </Col>

                        <Col md={5}>
                            <FormGroup>
                                <Label>Employment Type</Label>
                                <SourceSelect
                                    url='/api/students/get-student-status-enum'
                                    className="form-control"
                                    name="employmentType"
                                    id="employmentType"
                                    value={this.state.filters.employmentType}
                                    onChange={this.handleFieldChange}>
                                    <option value='All'>All Types</option>
                                </SourceSelect>
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={4} mdOffset={4}>
                            <FormGroup>
                                <Label>Payment Type</Label>
                                <SourceSelect
                                    url='/api/student-payments/get-payment-method-enum'
                                    className="form-control"
                                    name="paymentType"
                                    id="paymentType"
                                    value={this.state.filters.paymentType}
                                    onChange={this.handleFieldChange}>
                                    <option value='All'>All Types</option>
                                </SourceSelect>
                            </FormGroup>
                        </Col>
                    </Row>

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px', flexWrap: 'wrap' }}>
                        <input
                            className="form-control datepicker"
                            placeholder='begin date'
                            type="text"
                            id="beginDate"
                            name="beginDate"
                            value={this.state.filters.beginDate}
                            onChange={this.handleFieldChange}
                            style={styles.filterDatePicker}
                        />

                        <Label style={styles.untilLabel}>Until</Label>

                        <input
                            className="form-control datepicker"
                            placeholder='end date'
                            type="text"
                            id="endDate"
                            name="endDate"
                            value={this.state.filters.endDate}
                            onChange={this.handleFieldChange}
                            style={styles.filterDatePicker}
                        />
                    </div>

                    <Row>
                        <Col md={10} mdOffset={1}>
                            <Row>
                                <Col md={4}>
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                                        <Label style={{ alignSelf: 'center', margin: '0' }}>
                                            {'Show Only Current Term & Year'}
                                        </Label>

                                        <input
                                            style={{ margin: '0px 0px 0px 15px', alignSelf: 'center' }}
                                            type='checkbox'
                                            id='currTermOnly'
                                            name='currTermOnly'
                                            value={this.state.filters.currTermOnly}
                                            onChange={this.handleFieldChange}
                                        />
                                    </div>
                                </Col>

                                <Col md={4}>
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                                        <Label style={{ alignSelf: 'center', margin: '0' }}>
                                            Have admin notes
                                        </Label>

                                        <input
                                            style={{ margin: '0px 0px 0px 15px', alignSelf: 'center' }}
                                            type='checkbox'
                                            id='haveAdminNotes'
                                            name='haveAdminNotes'
                                            value={this.state.filters.haveAdminNotes}
                                            onChange={this.handleFieldChange}
                                        />
                                    </div>
                                </Col>

                                <Col md={4}>
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                                        <Label style={{ alignSelf: 'center', margin: '0' }}>
                                            Have reduced notes
                                        </Label>
                                        <input
                                            style={{ margin: '0px 0px 0px 15px', alignSelf: 'center' }}
                                            type='checkbox'
                                            id='haveReducedNotes'
                                            name='haveReducedNotes'
                                            value={this.state.filters.haveReducedNotes}
                                            onChange={this.handleFieldChange}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    <FormGroup>
                        <Button style={styles.filterButton} className='custom btn-success' type='submit'>Filter</Button>
                    </FormGroup>
                </form>
            </div>
        )
    }

    submit(e) {
        e.preventDefault()
        if (this.props.onFiltersSubmit) {
            this.props.onFiltersSubmit(this.state.filters)
        }
    }

    // TODO: remove duplicated field change handling functions in every component
    handleFieldChange(e, type = null) {
        type = type ? type : e.target.type

        var filters = this.state.filters
        var filterName = e.target.name
        switch(type) {
            case 'text':
            case 'select-one':
            case 'radio':
                filters[filterName] = e.target.value
                break
            case 'multi-checkbox':
                filterName = filterName.replace(/\[]/g, '')
                if (e.target.checked)
                    filters[filterName] = filters[filterName].concat(e.target.value)
                else
                    filters[filterName] = _.without(filters[filterName], e.target.value)
                break
            case 'checkbox':
                filters[filterName] = e.target.checked
                break
        }

        this.setState({filters: filters})
    }
}

class TransactionTable extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            isLoading: false,
            loadingWithNewFilters: false,
            totalCount: 0,
            rows: null
        }
        this.currentPage = 1
        this.rowsPerPage = 40
        this.loadPromise = null
        this.requestFields =  [
            'user.id',
            'registerDate',
            'course.courseTitle',
            'courseClass.classTime',
            'user.userFullname',
            'totalAmount',
            'regPaymentStatus',
            'regStatus'
        ]
        this.filters = null
    }

    render() {
        let rows = this.state.rows
        if (!this.state.isLoading && (!rows || rows.length === 0))
            return false

        return (
            <div>
                {this.showTable()}
                {this.showPaginator()}
            </div>
        )
    }

    showTable() {
        if (this.state.isLoading) {
            return (
                <div className='content-block'>
                    <h2 className='block-heading'>Transactions</h2>
                    <hr />

                    <div><Spinner /></div>
                </div>
            )
        }

        return (
            <div className='content-block'>
                <h2 className='block-heading'>Transactions</h2>
                <hr />

                <Table
                    data={this.state.rows}
                    showingProps={[
                        'registerDate',
                        'course.courseTitle',
                        'courseClass.classTime',
                        'user.userFullname',
                        'totalAmount',
                        'regPaymentStatus',
                        'regStatus'
                    ]}
                    headers={[
                        'Registration Time',
                        'Course Title',
                        'Class Time',
                        'Student Name',
                        'Amount',
                        'Payment Status',
                        'Reg Status'
                    ]}
                    createHead={headers => this.createHead(headers)}
                    createRow={(rowData, showingProps) => this.createRow(rowData, showingProps)}
                />

                <Exports filters={this.filters} />
            </div>
        )
    }

    showPaginator() {
        if (this.state.loadingWithNewFilters) return false

        return (
            <Paginator
                currentPage={this.currentPage}
                totalCount={this.state.totalCount}
                rowsPerPage={this.rowsPerPage}
                onPageChange={pageNum => { this.currentPage = pageNum; this.loadData(); }}/>
        )
    }

    componentWillReceiveProps(newProps) {
        if (newProps && newProps.filters) {
            this.filters = newProps.filters
            this.currentPage = 1
            this.setState({ loadingWithNewFilters: true })
            this.loadData()
        }
    }

    loadData() {
        this.setState({isLoading: true})

        var requestParams = {
            page: this.currentPage,
            rowsPerPage: this.rowsPerPage,
            fields: this.requestFields,
            filters: this.filters
        }

        this.loadPromise = PromiseHelper.makeCancelableAjax(
            $.ajax({
                type: 'get',
                url: '/api/transactions/all',
                data: requestParams
            })
        )
        this.loadPromise.promise.then(
            data => {
                this.setState({
                    rows: data.rows,
                    totalCount: data.info.totalCount,
                    isLoading: false,
                    loadingWithNewFilters: false
                })
            },
            xhr => console.log(xhr)
        )
    }

    createHead(headers) {
        var head = []
        head = head.concat(Table.createHeadBase(headers))
        head.push(<td key='actions'></td>)

        return head
    }

    createRow(rowData, showingProps) {
        var rowContent = []
        rowContent = rowContent.concat(Table.createRowBase(rowData, showingProps))
        rowContent.push(<td key='actions'><Link to={'/users/' + get(rowData, 'user.id', 'deleted')}>Detail</Link></td>)

        return rowContent
    }

    componentWillUnmount() {
        if (this.loadPromise)
            this.loadPromise.cancel()
    }
}