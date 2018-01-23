import React from 'react'
import Table from './../common/Table.jsx'
import PromiseHelper from './../../utils/PromiseHelper.js'
import { Link } from 'react-router'
import Paginator from './../common/Paginator.jsx'
import Oh from './../../utils/ObjHelper'
import StringHelper from './../../utils/StringHelper.js'
import { ROLES } from '../../config/constants.js'
import Spinner from '../common/Spinner.jsx'
import { DatePicker } from '../common/FormWidgets.jsx'
import { Row, Col, Button } from 'react-bootstrap'
import SourceSelect from '../common/SourceSelect'

export default class Logs extends React.Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            data: null,
            isLoading: true,
            totalCount: 0,
            filters: { userFullname: '', createdAtStart: '', createdAtEnd: '', action: '' },
            submittedFilters: {}
        }
        this.allowedRoles = [ROLES.SUPER_ADMIN]
        this.loadPromise = null
        this.rowsPerPage = 100
        this.currentPage = 1
        this.fields = ['id', 'user.userName', 'action', 'module', 'moduleId', 'actionTime', 'actionIp', 'loggingData']
        this.intervalId = null

        this.submitFilters = this.submitFilters.bind(this)
        this.updateFilters = this.updateFilters.bind(this)
        this.handleChangeEvent = this.handleChangeEvent.bind(this)
    }

    isAllowed() {
        const { appTypeKey } = this.props
        return this.allowedRoles.includes(appTypeKey)
    }

    updateFilters(name, value) {
        let { filters } = this.state
        filters[name] = value
        this.setState({ filters: filters })
    }

    handleChangeEvent(e) {
        this.updateFilters(e.target.name, e.target.value)
    }

    submitFilters() {
        this.setState({ submittedFilters: this.state.filters })
    }

    formatDate(date, format) {
        if (!date) return date
        var parts = date.split('-')
        switch (format) {
            case 'dd-mm-yyyy':
                if (parts[0].length === 4) {
                    parts.reverse()
                }
                break
            case 'yyyy-mm-dd':
                if (parts[2].length === 4) {
                    parts.reverse()
                }
                break
        }

        return parts.join('-')
    }

    componentDidMount() {
        if (!this.isAllowed()) return

        this.loadData()
        this.intervalId = setInterval(() => this.loadData(), 2000)

        DatePicker.init((name, value) => this.updateFilters(name, this.formatDate(value, 'yyyy-mm-dd')))
    }

    componentWillUnmount() {
        if (this.loadPromise)
            this.loadPromise.cancel()

        if (this.intervalId)
            clearInterval(this.intervalId)
    }

    render() {
        if (!this.isAllowed()) return <div></div>

        return (
            <div>
                {this.props.noFilterForm ? "" :
                    <div className='content-block'>
                        {this.renderFilters()}
                    </div>
                }

                <div className='content-block' style={{ paddingTop: '35px' }}>
                    {this.renderTable()}
                    {this.renderPaginator()}
                </div>
            </div>
        )
    }

    renderFilters() {
        const { filters } = this.state

        return (
            <div style={{ margin: '20px 0 10px 0' }}>
                <Row>
                    <Col md={3} style={{ marginBottom: '10px' }}>
                        <input
                            type="text"
                            className='form-control'
                            name='userFullname'
                            value={filters.userFullname}
                            placeholder='user name'
                            onChange={this.handleChangeEvent}
                        />
                    </Col>

                    <Col md={3} style={{ marginBottom: '10px' }}>
                        <SourceSelect
                            url="/api/logs/log-actions"
                            className='form-control'
                            id="action"
                            name='action'
                            value={filters.action}
                            placeholder='action'
                            onChange={this.handleChangeEvent}
                        >
                            <option value="">Select Action</option>
                        </SourceSelect>
                    </Col>

                    <Col md={3} style={{ marginBottom: '10px' }}>
                        <input
                            type="text"
                            className='form-control datepicker'
                            name='createdAtStart'
                            value={filters.createdAtStart}
                            placeholder='after date'
                        />
                    </Col>

                    <Col md={3} style={{ marginBottom: '10px' }}>
                        <input
                            type="text"
                            className='form-control datepicker'
                            name='createdAtEnd'
                            value={filters.createdAtEnd}
                            placeholder='before date'
                        />
                    </Col>
                </Row>

                <Row>
                    <Col md={3}>
                        <Button className='custom' bsStyle='success' onClick={this.submitFilters}>Filter</Button>
                    </Col>
                </Row>
            </div>
        )
    }

    renderTable() {
        const { data, isLoading } = this.state

        if (isLoading)
            return (
                <Spinner />
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
                headers={[
                    'Staff Username',
                    'Action',
                    'Module',
                    'Action Time',
                    'Action IP Address',
                    'ISP',
                    'Log data'
                ]}
                createHead={headers => this.createHead(headers)}
                createRow={(rowObj, showingProps) => this.createRow(rowObj, showingProps)}
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
                    this.setState({ isLoading: true })
                    this.loadData()
            }}/>
        )
    }

    loadData() {
        let filters = this.state.submittedFilters

        if (this.props.params) {
            Object.assign(filters, this.props.params)
        }

        var requestParams = {
            rowsPerPage: this.rowsPerPage,
            page: this.currentPage,
            fields: this.fields,
            filters: filters,
        }

        this.loadPromise = PromiseHelper.makeCancelableAjax(
            $.ajax({
                type: 'get',
                url: '/api/logs',
                data: requestParams
            })
        )
        this.loadPromise.promise.then(
            data => this.setState({isLoading: false, data: data.rows, totalCount: data.info.totalCount}),
            xhr => console.log(xhr)
        )
    }

    createHead(headers) {
        var head = Table.createHeadBase(headers)
        head.push(<td key='controls'></td>)
        return head
    }

    createRow(rowObj) {
        var rowContent = []
        rowContent.push(
            <td key='username'>
                {StringHelper.ucWords(Oh.accessObjByPath(rowObj, 'user.userName'))}
            </td>
        )
        rowContent.push(<td key='action'>{StringHelper.ucWords(rowObj.action)}</td>)

        var module = StringHelper.ucWords(rowObj.module)

        rowContent.push(<td key='module'>{module}</td>)

        // rowContent.push(<td key='moduleId'>{rowObj.moduleId}</td>)
        rowContent.push(<td key='actionTime'>{rowObj.actionTime}</td>)
        rowContent.push(<td key='actionIp'>{rowObj.actionIp}</td>)

        rowContent.push(<td key="loggingData">
            {Oh.getIfExists(rowObj, 'loggingData.isp', '') + ' / ' + Oh.getIfExists(rowObj, 'loggingData.city', '')}
        </td>)

        rowContent.push(<td key="userFullname">
            {Oh.getIfExists(rowObj, 'loggingData.Fullname', Oh.getIfExists(rowObj, 'loggingData.student', ''))}

            {rowObj.loggingData.courseTitle ? rowObj.loggingData.courseTitle + ' - ' + rowObj.loggingData.classTime : ''}
        </td>)
        
        rowContent.push(<td key='controls'><Link to={'/logs/' + rowObj.id}>Log</Link></td>)
        return rowContent
    }
}