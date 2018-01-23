import React, { PropTypes, Component } from 'react'
import DataLoader from '../../../common/DataLoader.jsx'
import O from '../../../../utils/ObjHelper.js'

const StudentReport = DataLoader(
    class extends Component {
        renderExams() {
            const get = O.getIfExists
            const { data } = this.props
            const attendances = data.attendances
            const exams = get(data, 'student.exams')

            if (!exams || exams.length === 0) {
                return false
            }

            return (
                <div className='print-container'>
                    <p><b>Exams: </b></p>
                    <table className='table print-table'>
                        <thead>
                        <tr>
                            <th>Exam</th>
                            <th>Score</th>
                            <th>Attendance</th>
                            <th>Comment</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            exams.map((exam, i) => {
                                const attendance = (exam.attendanceCode in attendances) ?
                                    attendances[exam.attendanceCode].label : 'none'

                                return (
                                    <tr key={i}>
                                        <td>{exam.title}</td>
                                        <td>{exam.score}</td>
                                        <td>{attendance}</td>
                                        <td>{exam.comment}</td>
                                    </tr>
                                )
                            })
                        }
                        </tbody>
                    </table>
                </div>
            )
        }

        renderLessons() {
            const { data } = this.props
            const get = O.getIfExists
            const lessons = get(data, 'student.lessons')

            if (!lessons || lessons.length === 0) {
                return false
            }

            return (
                <div className='print-container'>
                    <p><b>Lessons: </b></p>
                    <table className='table print-table'>
                        <thead>
                        <tr>
                            <th>Date</th>
                            <th>Class work</th>
                            <th>Home work</th>
                            <th>Attendance</th>
                            <th>Comment</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            lessons.map((lesson, i) => {

                                return (
                                    <tr key={i}>
                                        <td>{lesson.date}</td>
                                        <td>{lesson.doneWork}</td>
                                        <td>{lesson.homeWork}</td>
                                        <td>{lesson.attendance}</td>
                                        <td>{lesson.comment}</td>
                                    </tr>
                                )
                            })
                        }
                        </tbody>
                    </table>
                </div>
            )
        }

        render() {
            setTimeout(window.print, 500)

            const { data } = this.props
            const get = O.getIfExists
            
            const h2Style = {
                fontWeight: 'bold'
            }

            const userName = get(data, 'student.user.userFullname')
            const teacherName = get(data, 'student.courseClass.teacher.userFullname', '')
            const courseTitle = get(data, 'student.course.courseTitle')
            const classTime = get(data, 'student.courseClass.classTime')
            const termName = get(data, 'student.courseClass.term.name', '')
            const gender = get(data, 'student.user.profile.profileGender')
            const regDate = get(data, 'student.registerDate')
            const regStatus = get(data, 'student.regStatus')
            const paymentStatus = get(data, 'student.regPaymentStatus')
            const paymentMethod = get(data, 'student.regPaymentMethod')
            const studentStatus = get(data, 'student.studentStatus')
            const reducedNotes = get(data, 'student.reducedNotes')
            const feeEmployed = get(data, 'student.course.feeForEmployed', 0)
            const feeUnemployed = get(data, 'student.course.feeForUnemployed', 0)
            const totalAmount = get(data, 'student.totalAmount', 0)
            const finalGrade = get(data, 'student.gradeStatus')
            const classKeyCode = get(data, 'student.courseClass.classKeyCode')
            const adminNotes = get(data, 'student.adminNotes')

            var statusAdditionalInfo = ''
            switch (studentStatus) {
                case 'employed':
                    statusAdditionalInfo = `(Fee: £ ${parseFloat(feeEmployed).toFixed(2)})`
                    break
                case 'unemployed':
                    statusAdditionalInfo = `(Fee: £ ${parseFloat(feeUnemployed).toFixed(2)})`
                    break
                case 'reduced':
                    statusAdditionalInfo = `(${reducedNotes})`
                    break
            }


            return (
                <div>
                    <div className='print-container'>
                        <h2 style={h2Style}>Student: {userName}</h2>

                        <h2 style={h2Style}>{courseTitle}: {classTime}</h2>

                        <h2 style={h2Style}>Teacher: {teacherName}</h2>
                    </div>

                    <div className='print-container'>
                        <p><b>Term: </b>{termName}</p>

                        <p><b>Male/Female: </b>{gender}</p>

                        <p><b>Register Date: </b>{regDate}</p>

                        <p><b>Registration Status: </b>{regStatus}</p>

                        <p><b>Payment Status: </b>{paymentStatus}</p>

                        <p><b>Payment Method: </b>{paymentMethod}</p>

                        <p><b>Student Status: </b>{studentStatus} {statusAdditionalInfo}</p>

                        <p><b>Total Amount: </b>£ {parseFloat(totalAmount).toFixed(2)}</p>

                        <p><b>Final Grade: </b>{finalGrade}</p>

                        <p><b>Class Key Code: </b>{classKeyCode}</p>
                    </div>

                    <div className='print-container'>
                        <p><b>Admin Notes: </b></p>

                        <div dangerouslySetInnerHTML={{ __html: adminNotes }}></div>
                    </div>

                    {this.renderExams()}
                    {this.renderLessons()}
                </div>
            )
        }
    }
)

export default class extends Component {
    render() {
        const { id } = this.props.params

        return (
            <StudentReport
                ajaxOperations={{
                    load: { type: 'get', url: `/api/students/${id}/export-student-data` }
                }}
                logEnabled
            />
        )
    }
}