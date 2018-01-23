import React, { Component, PropTypes } from 'react'
import { Grid, Row, Col, Button } from 'react-bootstrap'
import DashboardFilterForm from './DashboardFilterForm.jsx'
import DataLoader from '../common/DataLoader.jsx'
import { DatePicker } from '../common/FormWidgets.jsx'
import Ph from '../../utils/PromiseHelper.js'
import Oh from '../../utils/ObjHelper'
import Sh from '../../utils/StringHelper'
import Notifier from '../../utils/Notifier'
import Spinner from '../common/Spinner.jsx'
import Table from '../common/Table'
import { Link } from 'react-router'
import { ROLES } from '../../config/constants'
import ClassStudentsWnd from '../base/courseClasses/ClassStudentsWnd'

const get = Oh.getIfExists

let styles = {
    placesDateInputLeft: { width: '110px', display: 'inline-block' },
    placesDateInputRight: { width: '110px', display: 'inline-block', marginLeft: 20 },
    placesDateButton: { marginLeft: '20px' },
    blockWrapper: {}
}
// mobile device
if (window.innerWidth < 768) {
    styles = {
        placesDateInputLeft: { marginBottom: 10 },
        placesDateInputRight: { marginBottom: 10 },
        placesDateButton: { width: '100%', marginBottom: 10 },
        blockWrapper: { borderTop: '1px solid #ccc', marginTop: 20, paddingTop: 10 }
    }
}

class DashboardAdmin extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            info: {},
            filters: { term: props.data.id },
            beginDate: '',
            endDate: '',
            hearPlacesInfo: null,
            classes: { male: [], female: [] },
            payments: [],
            showClassStudentsWnd: false
        }
        this.loadDashboardInfo = this.loadDashboardInfo.bind(this)
        this.loadHearPlacesInfo = this.loadHearPlacesInfo.bind(this)
        this.renderClassesTableRow = this.renderClassesTableRow.bind(this)
        this.loadClasses = this.loadClasses.bind(this)
        this.load = this.load.bind(this)
        this.onChange = this.onChange.bind(this)
    }

    loadDashboardInfo(filters) {
        if (!filters) filters = this.state.filters

        let requestSettings = {
            url: '/api/dashboard',
            dataType: 'json',
            success: (data) => {
                this.setState({ info: data })
            },
            error(xhr, status, err) {
                Notifier.error(xhr.responseText)
                console.error(xhr.responseText)
            }
        }

        if (filters) {
            requestSettings['type'] = 'post'
            requestSettings['data'] = {
                term: filters.term
            }
        } else {
            requestSettings['type'] = 'get'
        }

        $.ajax(requestSettings);
    }

    loadHearPlacesInfo() {
        const { beginDate, endDate } = this.state

        this.loadHearPlacesP && this.loadHearPlacesP.cancel()
        this.loadHearPlacesP = Ph.ajax({
            type: 'get',
            url: '/api/hear-places/info',
            data: { beginDate: beginDate, endDate: endDate }
        })

        this.loadHearPlacesP.then(
            data => this.setState({ hearPlacesInfo: data }),
            xhr => console.error(xhr)
        )
    }

    loadClasses(filters) {
        $.ajax({
            type: 'get',
            url: '/api/classes',
            data: {
                filters: filters,
                fields: [
                    'id',
                    'classGender',
                    'course.courseTitle',
                    'course.dept.weight',
                    'classTime',
                    'teacher.userFullname',
                    'studentsCount',
                    'classroom.classroomName'
                ]
            },
            success: data => {
                let classes = { male: [], female: [] }
                data.rows.forEach(item => {
                    classes[item.classGender == 'both' ? 'male' : item.classGender].push(item)
                })
                this.setState({ classes: classes })
            },
            error: xhr => {
                Notifier.error(xhr.responseText)
                console.error(xhr.responseText)
            }
        })
    }

    loadPaymentsInfo(filters) {
        if (!filters) filters = this.state.filters

        $.ajax({
            type: 'get',
            url: '/api/student-payments/total',
            data: { filters: filters },
            success: data => this.setState({ payments: data }),
            error: xhr => {
                Notifier.error(xhr.responseText)
                console.error(xhr)
            }
        })
    }

    load(filters) {
        if (!filters) filters = this.state.filters
        this.loadDashboardInfo(filters)
        this.loadClasses(filters)
        this.loadPaymentsInfo(filters)
    }

    updateDatePickers() {
        DatePicker.init(
            (name, value) => this.setState({ [name]: value })
        )
    }

    onChange(e) {

        this.setState({ [e.target.name]: e.target.value })
    }

    componentDidMount() {
        this.updateDatePickers();
    }

    componentDidUpdate() {
        this.updateDatePickers();
    }

    componentWillMount() {

        this.loadHearPlacesInfo()
        this.load()
    }

    renderHearPlacesInfo() {
        const { hearPlacesInfo, beginDate, endDate } = this.state
        if (!hearPlacesInfo) return <div></div>

        let rows = []
        const itemStyle = { borderBottom: '1px solid rgba(0, 0, 0, 0.15)', height: '30px' }

        for (let i in hearPlacesInfo) {
            const item = hearPlacesInfo[i]
            if (!item.placeName) continue

            rows.push(
                <p key={i} style={itemStyle}>
                    {item.placeName} : {item.count} people
                </p>
            )
        }

        return (
            <div style={styles.blockWrapper}>
                <h4>Places where people heard about us</h4>

                <div style={{ marginBottom: '10px' }}>
                    <input
                        className='form-control datepicker'
                        name='beginDate'
                        value={beginDate}
                        onChange={this.onChange}
                        placeholder='begin date'
                        style={styles.placesDateInputLeft}
                    />

                    <input
                        className='form-control datepicker'
                        name='endDate'
                        value={endDate}
                        onChange={this.onChange}
                        placeholder='end date'
                        style={styles.placesDateInputRight}
                    />

                    <Button
                        className='custom btn-success'
                        style={styles.placesDateButton}
                        onClick={this.loadHearPlacesInfo}
                    >
                        Search1
                    </Button>
                </div>

                <div>{rows.length > 0 ? rows : 'No data yet'}</div>
            </div>
        )
    }

    renderTotalPayments() {
        const { payments } = this.state

        if (!payments || payments.length == 0 || get(this.context, 'user.role.roleName', '') != ROLES.SUPER_ADMIN) return <div></div>

        return (
            <div>
                <h4>Total payments</h4>

                {payments.map((item, i) => <p key={i}>{Sh.ucFirst(item.paymentMethod)} : {item.amount}</p>)}
            </div>
        )
    }

    renderClassesTableRow(row) {
        const { router } = this.context

        let tData = []
        const push = (() => { let i = 0; return elem => tData.push(<td key={i++}>{elem}</td>) })()

        push(get(row, 'course.courseTitle', ''))
        push(<a style={{ cursor: 'pointer' }} onClick={() => router.push(`/classes/${row.id}/`)}>{row.classTime}</a>)
        //push(<a style={{ cursor: 'pointer'}} onClick={() => this.setState({ classId: row.id, showClassStudentsWnd: true })}>Attendance</a>)
        push(
            <Link
                to={`/classes/${row.id}/students?tab=Attendance+records`}
                target='_blank'
            >
                <p
                    style={{ cursor: 'pointer', color: '#337ab7', textDecoration: 'none' }}
                >
                    Attendance
                </p>
            </Link>
        )
        push(get(row, 'teacher.userFullname', ''))
        push(row.studentsCount)
        push(get(row, 'classroom.classroomName', ''))

        return tData
    }

    renderClassTables() {
        const { classes, className } = this.state

        const classNameFilter = item =>
            !className ||
            (get(item, 'course.courseTitle', '') + item.classTime).toLowerCase().indexOf(className.toLowerCase()) !== -1

        const byCourseAndDept = (a, b) => {
            const deptWeightA = get(a, 'course.dept.weight', 0)
            const deptWeightB = get(b, 'course.dept.weight', 0)

            if (deptWeightA < deptWeightB) {
                return -1
            } else if (deptWeightA > deptWeightB) {
                return 1
            } else {
                return (get(a, 'course.courseTitle', '') < get(b, 'course.courseTitle', '')) ? -1 : 1
            }
        }

        return (
            <div>
                <div>
                    <input
                        className="form-control"
                        style={{ width: '300px' }}
                        placeholder="course title / class name search"
                        type="text"
                        name="className"
                        onChange={this.onChange}
                        value={className}
                    />
                </div>

                <Grid fluid>
                    <Row style={{ marginBottom: '10px' }}>
                        <h4>Male classes</h4>

                        <Table
                            data={classes.male.filter(classNameFilter).sort(byCourseAndDept)}
                            headers={['Course Name', 'Class name', 'Attendance', 'Teacher', 'Students Count', 'Classroom']}
                            createRow={this.renderClassesTableRow}
                        />
                    </Row>
                </Grid>

                <Grid fluid>
                    <Row style={{ marginBottom: '10px' }}>
                        <h4>Female classes</h4>

                        <Table
                            data={classes.female.filter(classNameFilter).sort(byCourseAndDept)}
                            headers={['Course Name', 'Class name', 'Attendance', 'Teacher', 'Students Count', 'Classroom']}
                            createRow={this.renderClassesTableRow}
                        />
                    </Row>
                </Grid>
            </div>
        )
    }

    render() {
        const { info, filters } = this.state

        if (!info) return false

        let leftColumn = [], rightColumn = [], dashBoardInfo = []
        let infoKeys = Object.keys(info)
        for (let i = 0; i < infoKeys.length; i++) {
            let item = (
                <p style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.15)', paddingBottom: '10px' }} key={i}>
                    {info[infoKeys[i]]} | {infoKeys[i]}
                </p>
            )

            dashBoardInfo.push(item)
            i % 2 === 0 ? leftColumn.push(item) : rightColumn.push(item)
        }

        var showForm = infoKeys.length > 0;

        const { showClassStudentsWnd, classId } = this.state

        return (
            <div>
                <div id="notifications"></div>

                <div className='content-block'>
                    <h2 className='block-heading'>Dashboard</h2>
                    <hr />

                    <Row style={{ marginBottom: '10px' }}>
                        <Col md={6}>
                            {leftColumn}
                        </Col>

                        <Col md={6}>
                            {rightColumn}
                        </Col>
                    </Row>

                    <DashboardFilterForm
                        initialFilters={{ term: this.props.data.id }}
                        onFiltersSubmit={this.load}
                        visible={showForm}
                    />

                    {this.renderTotalPayments()}

                    <Row style={{ marginBottom: '10px' }}>
                        <Col lg={6}>
                            <CoursesQuickView termId={filters.term} />
                        </Col>

                        <Col lg={6}>
                            {this.renderHearPlacesInfo()}
                        </Col>
                    </Row>

                    {this.renderClassTables()}

                    <ClassStudentsWnd
                        show={showClassStudentsWnd}
                        selectedTab={1}
                        params={{ id: classId }}
                        appTypeKey={ROLES.REGISTRAR}
                        onClose={() => this.setState({ showClassStudentsWnd: false })}
                    />
                </div>
            </div>
        )
    }
}

DashboardAdmin.contextTypes = {
    user: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired
}

export default DataLoader(DashboardAdmin, {
    load: { type: 'get', url: '/api/terms/active' }
})

class CoursesQuickView extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { offset: 0, step: 10, limit: 10, data: [], isLoading: false }
        this.showMore = this.showMore.bind(this)
        this.load = this.load.bind(this)
    }

    load(filters) {
        const { branchId } = this.context
        const { limit, offset } = this.state
        const { termId } = this.props

        this.setState({ isLoading: true })

        if (!filters) filters = { branchId: branchId }
        Object.assign(filters, { countStudents: true, termId: termId })

        if (this.loader) this.loader.cancel()
        this.loader = Ph.ajax({
            type: 'get',
            data: filters,
            url: '/api/courses/list'
        })

        const onEnd = () => this.setState({ isLoading: false })
        this.loader.then(
            data => {
                let { data: currData } = this.state
                currData = currData.concat(data)
                this.setState({ data: currData })
                onEnd()
            },
            xhr => { console.error(xhr); onEnd(); }
        )
    }

    showMore() {
        const { offset, step } = this.state
        this.setState({ offset: offset + step })
    }

    componentWillMount() {
        this.load()
    }

    componentWillReceiveProps(nextProps, nextContext) {
        let updated = {}
        let filters = null
    if (this.context.branchId != nextContext.branchId) {
            filters = { branchId: nextContext.branchId}
            Object.assign(updated, { data: [], offset: 0 })
        }

        if (this.props.termId != nextProps.termId) {
            updated.termId = nextProps.termId
        }
        if (Object.keys(updated).length > 0) {
            this.setState(updated, () => this.load(filters))
        }
    }

    renderCourses() {
        const { data, limit, offset } = this.state
        let courses = []

        for (var i = 0; i < limit + offset && i < data.length; i++) {
            courses.push(
                <li key={i}>
                    <Link to={`/courses/${data[i].value}/classes`}>
                        {data[i].studentsCount} - {data[i].label}
                    </Link>
                </li>
            )
        }
        return courses
    }

    render() {
        const { isLoading, limit, offset, data } = this.state

        if (isLoading) return <Spinner />

        return (
            <div>
                <h4>Courses</h4>

                <ul style={{ paddingLeft: '20px' }}>
                    {this.renderCourses()}
                </ul>

                {limit + offset < data.length ?
                    <Button onClick={this.showMore} style={{ width: '100%' }}>See more</Button> : <div></div>
                }
            </div>
        )
    }
}

CoursesQuickView.contextTypes = {
    branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}