import React, { PropTypes, Component } from 'react'
import DataLoader from '../../common/DataLoader.jsx'
import RoleFilter from '../../common/RoleFilter.jsx'
import CourseHeaderAdmin from '../../admin/CourseHeaderAdmin.jsx'
import { ROLES } from '../../../config/constants.js'
import { FormField, DatePicker } from '../../common/FormWidgets.jsx'
import { Button } from 'react-bootstrap'
import O from '../../../utils/ObjHelper.js'
import Notifier from '../../../utils/Notifier.js'
import autosize from '../../../libs/autosize.js'

export default props => {
    const { id } = props.params

    return (
        <Wrapper
            ajaxOperations={{
                load: {
                    type: 'get',
                    url: `/api/classes/${id}`,
                    data: {
                        fields: [
                            'course.courseTitle',
                            'classTime',
                            'teacher.userFullname',
                            'classWorks',
                            'studentsAttendance'
                        ]
                    }
                },
                save: { type: 'put', url: `/api/classes/${id}` }
            }}
            logEnabled
            {...props}
        />
    )
}

class ClassRegisterAttendance extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            data: props.data, date: new Date().toJSON().slice(0,10),
            currentClassWork: {},
            attendanceEditMode: false
        }
        this.onChange = this.onChange.bind(this)
        this.save = this.save.bind(this)
        this.goToAttendanceTable = this.goToAttendanceTable.bind(this)
    }

    onChange(e) {
        const { name, value } = e.target
        const { date } = this.state
        var { data, data: { classWorks } } = this.state
        const { id } = this.props.params

        var isSet = false
        for (let i = 0; i < classWorks.length; i++) {
            if (classWorks[i].date == date) {
                classWorks[i][name] = value
                isSet = true
                break
            }
        }

        if (!isSet) {
            classWorks.push({ date: date, [name]: value, courseClassId: id })
        }

        console.log(data)
        this.setState({ data: data })
    }

    getCurrentClassWork() {
        const { date, data: { classWorks } } = this.state

        for (let i = 0; i < classWorks.length; i++) {
            if (classWorks[i].date == date) {
                return classWorks[i]
            }
        }

        return null
    }

    save() {
        var { data } = this.state
        const { save } = this.props
        save({ classWorks: data.classWorks }, newData => {
            data.classWorks = newData.classWorks
            this.setState({ data: data })
        })
    }

    renderClassTitle() {
        const { data } = this.state
        const get = O.getIfExists
        const courseTitle = get(data, 'course.courseTitle', '')
        const classTime = get(data, 'classTime', '')
        const teacherName = get(data, 'teacher.userFullname', '')

        return  (
            <div>
                <h2 className='block-heading'>{`${courseTitle}: ${classTime}`}</h2>
                <br />
                <h2 className='block-heading'>{`Teacher: ${teacherName}`}</h2>
                <hr />
            </div>
        )
    }

    goToAttendanceTable() {
        this.save()
        const { id } = this.props.params
        this.context.router.push({
            pathname: `/classes/${id}/students`,
            query: { tab: 'Attendance records' }
        })
    }

    renderForm() {
        const { date, data: { studentsAttendance }, attendanceEditMode } = this.state
        const classWork = this.getCurrentClassWork()
        const get = O.getIfExists

        if (attendanceEditMode) {
            return (
                <div>
                    <StudentsAttendance date={date} data={studentsAttendance} onListEndReach={this.goToAttendanceTable} />
                </div>
            )
        }

        return (
            <div>
                <FormField width={12} label='Work Covered'>
                    <textarea
                        name='doneWork'
                        style={{ height: '100px' }}
                        value={get(classWork, 'doneWork', '')}
                        className='form-control'
                        onChange={this.onChange}
                    >
                    </textarea>
                </FormField>

                <FormField width={12} label='Homework'>
                    <textarea
                        name='homeWork'
                        style={{ height: '100px' }}
                        value={get(classWork, 'homeWork', '')}
                        className='form-control'
                        onChange={this.onChange}
                    ></textarea>
                </FormField>

                <Button
                    className='custom btn-success'
                    onClick={() => this.setState({ attendanceEditMode: true })}
                >
                    Next
                </Button>
            </div>
        )
    }

    componentDidMount() {
        DatePicker.init((name, value) => {
            const parts = value.split('-')
            const formatedValue = ([parts[2], parts[1], parts[0]]).join('-')
            this.setState({ [name]: formatedValue })
        })

        $(() => {
            autosize($('textarea'))
        })
    }

    render() {
        const { date, data } = this.state

        if (!data.studentsAttendance || data.studentsAttendance.length == 0) {
            return (
                <h2>No students</h2>
            )
        }

        return (
            <div className="admin">
                <div className='content-block'>
                    {this.renderClassTitle()}

                    <FormField width={2}>
                        <input
                            name="date"
                            value={date}
                            className='form-control datepicker'
                            onChange={this.onChange}
                        />
                    </FormField>

                    {this.renderForm()}
                </div>
            </div>
        )
    }
}

ClassRegisterAttendance.contextTypes = {
    router: PropTypes.object.isRequired
}

const Wrapper = DataLoader(ClassRegisterAttendance)

class StudentsAttendance extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { data: props.data, currStudent: 0 }
        this.move = this.move.bind(this)
        this.onChange = this.onChange.bind(this)
        this.save = this.save.bind(this)
    }

    save() {
        const { currStudent, data } = this.state
        const studentInfo = data[currStudent]

        if (!studentInfo || !studentInfo.isChanged) {
            return false
        }

        $.ajax({
            type: 'put',
            url: `/api/students/${studentInfo.id}`,
            data: { attendance: studentInfo.attendance },
            success: newData => {
                studentInfo.attendance = newData.attendance
                data[currStudent] = studentInfo
                this.setState({ data: data })
            },
            error: xhr => {
                Notifier.error('Update failed')
                console.error(xhr)
            }
        })
    }

    getPos(currPos, length, offset) {
        currPos += offset
        if (currPos >= length) {
            currPos -= length
        } else if (currPos < 0) {
            currPos += length
        }

        return currPos
    }

    move(offset) {
        this.save()
        var { currStudent, data } = this.state
        this.setState({ currStudent: this.getPos(currStudent, data.length, offset) })
    }

    getCurrentAttendanceRecord(studentInfo) {
        const { date } = this.props
        const { attendance } = studentInfo

        for (let i = 0; i < attendance.length; i++) {
            if (attendance[i].date == date) {
                return attendance[i]
            }
        }

        return null
    }

    changeField(name, value) {
        const { date } = this.props
        const { currStudent } = this.state
        var { data } = this.state
        var studentInfo = data[currStudent]
        if (!studentInfo) {
            return false
        }

        var isSet = false
        var attendance = studentInfo.attendance
        for (let i = 0; i < attendance.length; i++) {
            if (attendance[i].date == date) {
                if (attendance[i][name] !== value) {
                    attendance[i][name] = value
                    studentInfo.isChanged = true
                }
                isSet = true
            }
        }

        if (!isSet) {
            var newAttendance = {
                studentId: studentInfo.id,
                date: date,
                comment: '',
                late: '0',
                attendance: 'absent'
            }

            newAttendance[name] = value

            attendance.push(newAttendance)

            studentInfo.isChanged = true
        }

        data[currStudent] = studentInfo
        this.setState({ data: data })
    }

    onChange(e) {
        this.changeField(e.target.name, e.target.value)
    }

    setAttendance(isPresent) {
        this.changeField('attendance', isPresent ? 'present' : 'absent')

        const { currStudent, data } = this.state
        const { onListEndReach } = this.props
        if (currStudent + 1 >= data.length) {
            this.save()
            onListEndReach()
        } else {
            this.move(1)
        }
    }

    render() {
        const get = O.getIfExists
        const { currStudent, data } = this.state
        const studentInfo = data[currStudent]
        const attendance = this.getCurrentAttendanceRecord(studentInfo)
        const attendanceButtonsStyle = { width: '100px', height: '50px' }

        if (!studentInfo) {
            return <h2>No student data</h2>
        }

        return (
            <div>
                <div style={{ marginBottom: '20px' }}>
                    <Button
                        className='custom'
                        onClick={() => this.move(-1)}
                        style={{ marginRight: '15px', minWidth: '100px' }}
                    >
                        {`Prev ${this.getPos(currStudent, data.length, -1) + 1}/${data.length}`}
                    </Button>

                    <Button
                        className='custom'
                        onClick={() => this.move(1)}
                        style={{ minWidth: '100px' }}
                    >
                        {`Next ${this.getPos(currStudent, data.length, +1) + 1}/${data.length}`}
                    </Button>
                </div>

                <h2>{studentInfo.user.userFullname}</h2>

                <FormField width={12}>
                    <textarea
                        name='comment'
                        style={{ height: '100px' }}
                        value={get(attendance, 'comment', '')}
                        className='form-control'
                        onChange={this.onChange}
                    >
                    </textarea>
                </FormField>

                {
                    currStudent + 1 >= data.length ?
                        <p>Last student</p> : ''
                }

                <div style={{ marginTop: '20px' }}>
                    <Button
                        onClick={() => this.setAttendance(false)}
                        className='custom btn-danger'
                        style={Object.assign(attendanceButtonsStyle, { marginRight: '15px' })}
                    >
                        Absent
                    </Button>

                    <Button
                        onClick={() => this.setAttendance(true)}
                        className='custom btn-green'
                        style={attendanceButtonsStyle}
                    >
                        Present
                    </Button>
                </div>
            </div>
        )
    }
}

StudentsAttendance.ProTypes = {
    date: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
    onListEndReach: PropTypes.func.isRequired
}