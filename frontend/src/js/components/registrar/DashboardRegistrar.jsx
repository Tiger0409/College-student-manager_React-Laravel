import React, { Component, PropTypes } from 'react'
import { Row, Col } from 'react-bootstrap'
import Oh from '../../utils/ObjHelper'
import Table from '../common/Table'
import Notifier from '../../utils/Notifier'
import Spinner from '../common/Spinner'
import ClassStudentsWnd from '../base/courseClasses/ClassStudentsWnd'
import { ROLES } from '../../config/constants'

const get = Oh.getIfExists

export default class DashboardRegistrar extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            info: {},
            classes: { male: [], female: [] },
            isLoading: true,
            showClassStudentsWnd : false,
            classId: null
        }
        this.onChange = this.onChange.bind(this)
        this.renderClassesTableRow = this.renderClassesTableRow.bind(this)
    }

    loadDashboardInfo(filters) {
        let requestSettings = {
            url: '/api/dashboard',
            dataType: 'json',
            success: (data) => {
                this.setState({info: data})
            },
            error(xhr, status, err) {
            }
        }

        if (filters) {
            requestSettings['type'] = 'post'
            requestSettings['data'] = {
                term: filters.term
            }
        } else
            requestSettings['type'] = 'get'

        $.ajax(requestSettings);
    }

    loadClasses(filters) {
        this.setState({ isLoading: true })

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
                this.setState({ classes: classes, isLoading: false })
            },
            error: xhr => {
                Notifier.error(xhr.responseText)
                console.error(xhr.responseText)
            }
        })
    }

    componentWillMount() {
        this.loadDashboardInfo()
        this.loadClasses()
    }

    onChange(e) {
        this.setState({ [e.target.name]: e.target.value })
    }

    renderClassesTableRow(row) {
        const { router } = this.context

        let tData = []
        const push = (() => { let i = 0; return elem => tData.push(<td key={i++}>{elem}</td>) })()

        push(get(row, 'course.courseTitle', ''))
        push(<a style={{ cursor: 'pointer'}} onClick={() => router.push(`/classes/${row.id}/`)}>{row.classTime}</a>)
        push(<a style={{ cursor: 'pointer'}} onClick={() => this.setState({ classId: row.id, showClassStudentsWnd: true })}>Attendance</a>)
        push(get(row, 'teacher.userFullname', ''))
        push(row.studentsCount)
        push(get(row, 'classroom.classroomName', ''))

        return tData
    }

    renderClassTables() {
        const { classes, className, isLoading } = this.state

        if (isLoading) {
            return (
                <div>
                    Loading...
                </div>
            )
        }

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

                <Row style={{ marginBottom: '10px' }}>
                    <h4>Male classes</h4>

                    <Table
                        data={classes.male.filter(classNameFilter).sort(byCourseAndDept)}
                        headers={['Course Name', 'Class name', 'Attendance', 'Teacher', 'Students Count', 'Classroom']}
                        createRow={this.renderClassesTableRow}
                    />
                </Row>

                <Row style={{ marginBottom: '10px' }}>
                    <h4>Female classes</h4>

                    <Table
                        data={classes.female.filter(classNameFilter).sort(byCourseAndDept)}
                        headers={['Course Name', 'Class name', 'Attendance', 'Teacher', 'Students Count', 'Classroom']}
                        createRow={this.renderClassesTableRow}
                    />
                </Row>
            </div>
        )
    }

    render() {
        if (this.state.info) {
            let leftColumn = [], rightColumn = [], dashBoardInfo = []
            let infoKeys = Object.keys(this.state.info)
            for (let i = 0; i < infoKeys.length; i++) {
                let item = (
                    <p style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.15)', height: '30px' }} key={i}>
                        {this.state.info[infoKeys[i]]} | {infoKeys[i]}
                    </p>
                )

                dashBoardInfo.push(item)
                i % 2 === 0 ? leftColumn.push(item) : rightColumn.push(item)
            }

            var showForm = infoKeys.length > 0;

            const { showClassStudentsWnd, classId } = this.state

            return (
                <div className='content-block'>
                    <h2 className='block-heading'>Dashboard</h2>
                    <hr />

                    <Row>
                        <Col md={6}>
                            {leftColumn}
                        </Col>

                        <Col md={6}>
                            {rightColumn}
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
            )
        }

        return false
    }
}

DashboardRegistrar.contextTypes = {
    router: PropTypes.object.isRequired
}