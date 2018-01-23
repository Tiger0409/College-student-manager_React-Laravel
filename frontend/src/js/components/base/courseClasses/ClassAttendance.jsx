import React, { PropTypes, Component } from 'react'
import RoleFilter from '../../common/RoleFilter.jsx'
import DataLoader from '../../common/DataLoader.jsx'
import { ROLES } from '../../../config/constants.js'
import Table from '../../common/Table.jsx'
import { Button } from 'react-bootstrap'
import { Link } from 'react-router'
import DateHelper from '../../../utils/DateHelper.js'
import ClassRegisterAttendanceWnd from './ClassRegisterAttendanceWnd'

export default props => {
    const { id } = props

    return (
        <Wrapper
            ajaxOperations={{
                load: { type: 'get', url: `/api/classes/${id}/attendance` }
            }}
            {...props}
        />
    )
}

class ClassAttendance extends Component {
    constructor(props, context) {
        super(props, context)
        this.createRow = this.createRow.bind(this)
        this.createHead = this.createHead.bind(this)
        this.createTotalRow = this.createTotalRow.bind(this)
        this.state = { showRegAttendanceWnd: false, classDates: [], studentsAttendance: [] }
        this.reload = this.reload.bind(this)
    }

    reload() {
        this.props.load()
    }

    componentDidMount() {
        this.parseData()
    }

    componentDidUpdate() {
        //this.parseData()
    }

    parseData() {
        const { data } = this.props

        var classDates = []
        var studentsAttendance = []
        for (let studentName in data) {
            let attendance = data[studentName]
            for (let i = 0; i < attendance.length; i++) {
                if (!classDates.includes(attendance[i].date)) {
                    classDates.push(attendance[i].date)
                }
            }

            studentsAttendance.push({ studentName: studentName, attendance: attendance })
        }

        this.setState({ classDates: classDates, studentsAttendance: studentsAttendance })
    }

    createHead() {
        const { classDates } = this.state

        const dateHeaderStyle = {
            transform: 'translate(-18px, 6px) rotate(290deg)',
            width: '50px',
            height: '75px',
            marginTop: '-6px',
            fontSize: '9pt',
            paddingLeft: '5px'
        }
        const centered = { textAlign: 'center' }
        var rowData = []
        var i = 0
        const rowPush = (item, thStyle) => rowData.push(<th key={i++} style={thStyle}>{item}</th>)

        rowPush('Student', { width: '370px' })
        classDates.forEach(
            dateStr => {
                const date = DateHelper.parseLocale(dateStr).toString('/')
                rowPush(<div><span>{date}</span></div>, dateHeaderStyle)
            }
        )
        rowPush('#', centered)
        rowPush('%', centered)

        return rowData
    }

    createRow(rowObj) {
        const { classDates } = this.state

        var rowData = []
        const centeredValueStyle = { textAlign: 'center', verticalAlign: 'middle' }
        const centeredValueStylePresent = {textAlign: 'center', verticalAlign: 'middle',color:'green'}
        const centeredValueStyleAbsent = {textAlign: 'center', verticalAlign: 'middle',color:'red'}
        var i = 0
        var rowPush = (element, style) => rowData.push(<td key={i++} style={style}>{element}</td>)

        rowPush(<p>{rowObj.studentName}</p>)

        var presentDaysCount = 0
        for (let i = 0; i < classDates.length; i++) {
            let isPresent = false
            for (let j = 0; j < rowObj.attendance.length; j++) {
                if (
                    rowObj.attendance[j].date === classDates[i] &&
                    rowObj.attendance[j].attendance === 'present'
                ) {
                    isPresent = true
                    presentDaysCount++
                    break
                }
            }
            if(isPresent){
                rowPush('✓',centeredValueStylePresent)
            }else{
                rowPush('X',centeredValueStyleAbsent)
            }
        }

        rowPush(presentDaysCount, centeredValueStyle)
        rowPush((presentDaysCount / classDates.length * 100).toFixed(1) + '%', centeredValueStyle)

        return rowData
    }

    createTotalRow() {
        const { classDates, studentsAttendance } = this.state

        var rowData = []
        var i = 0
        const rowPush = (item, style) => rowData.push(<td key={i++} style={style}>{item}</td>)
        rowPush('N in Attendance:')

        const centered = { textAlign: 'center' }

        for (let i = 0; i < classDates.length; i++) {
            let presentCount = 0

            for (let j = 0; j < studentsAttendance.length; j++) {
                let { attendance } = studentsAttendance[j]
                for (let k = 0; k < attendance.length; k++) {
                    if (attendance[k].date == classDates[i] && attendance[k].attendance == 'present') {
                        presentCount++
                    }
                }
            }

            rowPush(presentCount, centered)
        }

        rowPush('')
        rowPush('')

        return <tr key='total'>{rowData}</tr>
    }

    renderTable() {
        const { classDates, studentsAttendance } = this.state

        if (!classDates || classDates.length === 0) {
            return <h2>No attendance records yet</h2>
        }

        return (
            <Table
                style={{ tableLayout: 'fixed' }}
                data={studentsAttendance}
                createHead={this.createHead}
                createRow={this.createRow}
                additionalRows={this.createTotalRow()}
            />
        )
    }

    render() {
        const { id, appTypeKey } = this.props
        const { showRegAttendanceWnd } = this.state

        return (
            <div className='content-block'>
                <Link
                    target="_blank"
                    to={`/classes/${id}/register-attendance`}
                >
                    <Button
                        className='custom btn-success'
                        style={{ margin: '20px 0px 20px 0px' }}
                    >
                        Take todays attendance
                    </Button>
                </Link>

                {this.renderTable()}

                <ClassRegisterAttendanceWnd
                    id={id}
                    appTypeKey={appTypeKey}
                    show={showRegAttendanceWnd}
                    onClose={() => this.setState({ showRegAttendanceWnd: false })}
                    onUpdate={() => { this.reload(); this.setState({ showRegAttendanceWnd: false }) }}
                />
            </div>
        )
    }
}

ClassAttendance.contextTypes = {
    router: PropTypes.object
}

const Wrapper = RoleFilter(
    DataLoader(ClassAttendance),
    [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.TEACHER, ROLES.REGISTRAR]
)
