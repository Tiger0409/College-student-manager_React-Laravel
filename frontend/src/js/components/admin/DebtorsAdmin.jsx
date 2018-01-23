import React, { PropTypes, Component } from 'react'
import CourseHeaderAdmin from './CourseHeaderAdmin.jsx'
import Table from '../common/Table.jsx'
import PromiseHelper from '../../utils/PromiseHelper.js'
import Paginator from '../common/Paginator.jsx'
import { Link } from 'react-router'
import { Button, Row, Col } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { FormField } from '../common/FormWidgets.jsx'
import FormGroup from '../common/FormGroup.jsx'
import SourceSelect from '../common/SourceSelect.jsx'
import Spinner from '../common/Spinner.jsx'

let style = {
    buttonFilter: { marginTop: 24 }
}

if (window.innerWidth < 1024) {
    style = {
        buttonFilter: { width: '100%', marginBottom: 20 }
    }
}

export default class DebtorsAdmin extends React.Component {
    constructor(props, context) {
        super(props, context)
        this.state = { filters: {} }
    }

    render() {
        const { filters } = this.state

        return (
            <div>
                <CourseHeaderAdmin />
                <div className='content-block'>
                    <h2 className='block-heading'>Debtors</h2>
                    <DebtorsFilters onSubmit={filters => this.setState({ filters: filters })} />
                    <DebtorsTable filters={filters} />
                    <Exports filters={filters} />
                </div>
            </div>
        )
    }
}

class DebtorsFilters extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { filters: { deptBranchId: null, termId: null }, termOptions: [], courseFilter: '', firstInstalment: '', secondInstalment: '' }
        this.handleFieldChange = this.handleFieldChange.bind(this)
        this.submit = this.submit.bind(this)
    }

    componentWillMount() {
        $.ajax({
            type: 'get',
            url: '/api/terms/list',
            success: terms => {
                let options = []
                let { filters } = this.state
                for (let i = 0; i < terms.length; i++) {
                    if (terms[i].isActive == '1') {
                        filters.termId = terms[i].value
                    }

                    options.push(terms[i])
                }

                this.setState({ termOptions: options, filters: filters })
                this.submitFilters(filters)
            }
        })
    }

    render() {
        const { filters, termOptions } = this.state

        return (
            <div style={{ marginBottom: '15px' }}>
                <h4>Filters</h4>
                <form onSubmit={this.submit} className='row'>
                    <FormField width={5} label='Branch'>
                        <SourceSelect
                            url='/api/dept-branches/list'
                            className='form-control'
                            name='deptBranchId'
                            id='deptBranchId'
                            value={filters.deptBranchId}
                            onChange={this.handleFieldChange}>
                            <option value='All'>All branches</option>
                        </SourceSelect>
                    </FormField>

                    <FormField width={5} label='Term'>
                        <select
                            className='form-control'
                            name='termId'
                            id='termId'
                            value={filters.termId}
                            onChange={this.handleFieldChange}
                        >
                            {
                                termOptions.map(
                                    (term, i) => <option key={i} value={term.value}>{term.label}</option>
                                )
                            }
                        </select>
                    </FormField>

                    <FormField width={5} label='Courses'>
                        <SourceSelect
                            url='/api/courses/list'
                            params={{ branchId: this.context.branchId }}
                            className='form-control'
                            name='coursesFilter'
                            id='coursesFilter'
                            value={filters.courseSelect}
                            onChange={this.handleFieldChange}>
                            <option value='All'>All Courses</option>
                        </SourceSelect>
                    </FormField>

                    <FormField width={5} label='First instalment'>
                        <select
                            className='form-control'
                            name='firstInstalment'
                            id='firstInstalment'
                            value={filters.firstInstalment}
                            onChange={this.handleFieldChange}
                        >
                            <option value="">Any</option>
                            <option value="notNull">Not 0</option>
                        </select>
                    </FormField>

                    <FormField width={5} label='Second instalment'>
                        <select
                            className='form-control'
                            name='secondInstalment'
                            id='secondInstalment'
                            value={filters.secondInstalment}
                            onChange={this.handleFieldChange}
                            >
                            <option value="">Any</option>
                            <option value="notNull">Not 0</option>
                        </select>
                    </FormField>
                    <Col md={5}>
                        <Button className='custom btn-success' type='submit' style={style.buttonFilter}>Filter</Button>
                    </Col>
                </form>
            </div>
        )
    }

    submitFilters(filters) {
        this.props.onSubmit(filters)
    }

    submit(e) {
        if (e) {
            e.preventDefault()
        }

        this.submitFilters(this.state.filters)
    }

    handleFieldChange(e) {
        var { filters } = this.state
        filters[e.target.name] = e.target.value
        this.setState({filters: filters})
    }
}
DebtorsFilters.PropTypes = {
    onSubmit: PropTypes.func.isRequired
}

DebtorsFilters.contextTypes = {
    branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}

class DebtorsTable extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            isLoading: false,
            rows: null,
            info: { totalCount: 0 }
        }
        this.rowsPerPage = 20
        this.page = 1
        this.promises = { load: null }
    }

    componentWillMount() {
        this.loadData(this.props)
    }

    componentWillUnmount() {
        for (let key in this.promises)
            if (this.promises[key]) this.promises[key].cancel()
    }

    componentWillReceiveProps(newProps) {
        this.loadData(newProps)
    }

    render() {
        const { info } = this.state

        return (
            <div>
                {this.renderTable()}
                <Paginator
                    totalCount={info.totalCount}
                    rowsPerPage={this.rowsPerPage}
                    currentPage={this.page}
                    onPageChange={pageNum => {
                        this.page = pageNum
                        this.loadData()
                    }}/>
            </div>
        )
    }

    renderTable() {
        const { isLoading, rows } = this.state
        if (isLoading) return (<div><Spinner /></div>)

        if (rows.length == 0) return (<p>No data.</p>)

        return (
            <div>
                <Table
                    data={rows}
                    headers={[
                        'Student', 'Course Name', 'Paid', 'First instalment',
                        'Second instalment', 'Course Fee', 'Course Debt']}
                    createRow={rowObj => this.createRow(rowObj)}/>
            </div>
        )
    }

    loadData(props) {
        if (!props) {
            props = this.props
        }

        this.setState({ isLoading: true })

        if (Object.keys(props.filters).length === 0) {
            return
        }

        var requestParams = {
            rowsPerPage: this.rowsPerPage,
            page: this.page,
            filters: props.filters
        }

        if (this.promises.load)
            this.promises.load.cancel()

        this.promises.load = PromiseHelper.ajax({
            type: 'get',
            url: '/api/students/debtors',
            data: requestParams
        })
        this.promises.load.then(
            data => {
                this.setState({ isLoading: false, rows: data.rows, info: data.info })
            },
            xhr => console.log(xhr)
        )
    }

    createRow(rowObj) {
        const totalPaid = parseFloat(rowObj.paid)

        let courseFee = 0
        switch (rowObj.status) {
            case 'employed':
                courseFee = rowObj.feeForEmployed
                break
            case 'unemployed':
                courseFee = rowObj.feeForUnemployed
                break
            case 'reduced':
                courseFee = rowObj.reducedFee
                break
        }

        const firstInstalment = Math.max(courseFee / 2 - totalPaid, 0)
        const secondInstalment = firstInstalment > 0 ? courseFee / 2 : courseFee - totalPaid

        const courseDebt = courseFee - totalPaid

        var row = []
        row.push(<td key={0}><Link to={'/students/' + rowObj.id}>{rowObj.studentName}</Link></td>)
        row.push(<td key={1}>{rowObj.courseTitle}</td>)
        row.push(<td key={2}>{totalPaid}</td>)
        row.push(<td key={3}>{firstInstalment}</td>)
        row.push(<td key={4}>{secondInstalment}</td>)
        row.push(<td key={5}>{courseFee}</td>)
        row.push(<td key={6}>{courseDebt}</td>)
        return row
    }
}

DebtorsTable.PropTypes = {
    filters: PropTypes.object
}

DebtorsTable.defaultProps = {filters: {}}

let exportStyles = {
    exportButtonWrapper: { display: 'inline-block', alignSelf: 'center', marginLeft: '15px', marginBottom: '15px' },
    exportButton: { width: '190px' }
}

if (window.innerWidth < 768) {
    exportStyles = {
        exportButtonWrapper: { width: '100%', alignSelf: 'center', marginBottom: '15px' },
        exportButton: { width: '100%' }
    }
}

class Exports extends Component {
    renderExportBtn(url, paymentMethod, label) {
        let filters = Object.assign({}, this.props.filters)

        if (paymentMethod && paymentMethod.length > 0) {
            Object.assign(filters, { regPaymentMethod: paymentMethod })
        }

        filters = JSON.stringify(filters)
        url += `/${filters}`

        return (
            <Link
                style={exportStyles.exportButtonWrapper}
                target='_blank'
                to={url}
            >
                <Button className='custom' style={exportStyles.exportButton}>{label}</Button>
            </Link>
        )
    }
    
    render() {
        return (
            <div>
                <Row>
                    <Col md={12} style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {this.renderExportBtn('/students/print-debtors/addresses', '', 'All address')}
                        {this.renderExportBtn('/students/print-debtors/list', '', 'All list')}
                        {this.renderExportBtn('/students/print-debtors/addresses', 'active', 'Active address')}
                        {this.renderExportBtn('/students/print-debtors/list', 'active', 'Active list')}
                        {this.renderExportBtn('/students/print-debtors/addresses', 'payment_agreement', 'Agreement address')}
                    </Col>
                </Row>

                <Row>
                    <Col md={12} style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {this.renderExportBtn('/students/print-debtors/list', 'payment_agreement', 'Agreement list')}
                        {this.renderExportBtn('/students/print-debtors/addresses', 'instalment', 'Instalment address')}
                        {this.renderExportBtn('/students/print-debtors/list', 'instalment', 'Instalment list')}
                        {this.renderExportBtn('/students/print-debtors/addresses', 'payment_agreement', 'Agreement address')}
                        {this.renderExportBtn('/students/print-debtors/list', 'payment_agreement', 'Agreement list')}
                    </Col>
                </Row>

                <Row>
                    <Col md={10} mdOffset={1} style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {this.renderExportBtn('/students/print-debtors/addresses', 'no_response', 'No response address')}
                        {this.renderExportBtn('/students/print-debtors/list', 'no_response', 'No response list')}
                        {this.renderExportBtn('/students/print-debtors/addresses', 'withdrawn', 'Withdrawn address')}
                        {this.renderExportBtn('/students/print-debtors/list', 'withdrawn', 'Withdrawn list')}
                    </Col>
                </Row>
            </div>
        )
    }
}