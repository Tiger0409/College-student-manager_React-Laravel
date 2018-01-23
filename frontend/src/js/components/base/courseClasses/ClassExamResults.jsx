import React, { PropTypes, Component } from 'react'
import RoleFilter from '../../common/RoleFilter.jsx'
import DataLoader from '../../common/DataLoader.jsx'
import { ROLES } from '../../../config/constants.js'
import O from '../../../utils/ObjHelper.js'
import S from '../../../utils/StringHelper.js'
import Bench from '../../../utils/Bench.jsx'
import Rand from '../../../utils/Rand.js'
import { Button } from 'react-bootstrap'

export default props => {
    const { id } = props

    return (
        <Wrapper
            ajaxOperations={{
                load: { type: 'get', url: `/api/classes/${id}/exam-results` },
                save: { type: 'put', url: `/api/classes/${id}/exam-results` },
                loadCommentTypes: { type: 'get', url: '/api/lookup/get-attendance-level' },
                loadBank: { type: 'get', url: '/api/bank' }
            }}
            {...props}
        />
    )
}



class ClassExamResults extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { data: props.data, commentTypes: [], bank: [] }
        this.onFieldChange = this.onFieldChange.bind(this)
        this.onCommentTypeChange = this.onCommentTypeChange.bind(this)
        this.save = this.save.bind(this)
        this.populateComments = this.populateComments.bind(this)

        props.execute('loadCommentTypes', null, types =>
                this.setState({ commentTypes: types })
        )

        props.execute('loadBank', null, bank =>
                this.setState({ bank: bank })
        )
    }

    getCommentByType(type) {
        if (type === -1) return

        const { bank } = this.state
        const commentsByType = bank.filter(item => item.feedbackCode == type)
        const index = Rand.getInt(0, commentsByType.length)
        return commentsByType[index].feedbackDescription
    }

    onCommentTypeChange({ value: fieldValue }, studentIndex, examIndex) {
        var comment = this.getCommentByType(fieldValue)
        this.onFieldChange({ name: 'comment', value: comment }, studentIndex, examIndex)
    }

    onFieldChange({ name: fieldName, value: fieldValue }, studentIndex, examIndex) {
        var { data, data : { students }, data : {examResults } } = this.state
        const studentId = O.getIfExists(students[studentIndex], 'studentInfo.id', -1)

        if (typeof examIndex !== 'undefined') {
            let scores = examResults[examIndex].scores
            let valueIsSet = false
            for (let j in scores) {
                if (parseInt(scores[j].idCourseStudent) === studentId) {
                    scores[j][fieldName] = fieldValue
                    valueIsSet = true
                    break
                }
            }

            if (!valueIsSet) {
                scores.push({
                    idCourseStudent: studentId,
                    idAdditionalExam: O.getIfExists(examResults[examIndex], 'exam.id', -1),
                    [fieldName]: fieldValue
                })
            }
            examResults[examIndex].scores = scores
        } else {
            if (students[studentIndex].finalGrade === null) {
                students[studentIndex].finalGrade = {
                    courseStudentId: studentId,
                    [fieldName]: fieldValue
                }
            } else {
                students[studentIndex].finalGrade[fieldName] = fieldValue
            }
        }

        this.setState({ data: data })
    }

    save() {
        const { save } = this.props
        const { data } = this.state

        save({ data: data }, newData => this.setState({ data: newData }))
    }

    populateComments() {
        var { data, data: { students }, data: { examResults } } = this.state
        for (let i = 0; i < students.length; i++) {
            if (!students[i].finalGrade) {
                continue
            }

            if (students[i].finalGrade.comment && students[i].finalGrade.comment.length > 0) {
                continue
            }

            let commentType = parseInt(students[i].finalGrade.attendanceCode)
            students[i].finalGrade.comment = this.getCommentByType(commentType)
        }

        for (let i = 0; i < examResults.length; i++) {
            let scores = examResults[i].scores
            for (let j = 0; j < scores.length; j++) {
                if (scores[j].comment && scores[j].comment.length > 0) {
                    continue
                }

                let commentType = parseInt(scores[j].attendanceCode)
                scores[j].comment = this.getCommentByType(commentType)
            }
        }

        this.setState({ data: data })
    }

    renderBody() {
        const { students, examResults } = this.state.data
        const { commentTypes } = this.state
        const get = O.getIfExists

        var examsOutput = [[]]
        examResults.forEach((item, i) => examsOutput.push([]))

        students.forEach(
            (student, i) => {
                let id = parseInt(get(student, 'studentInfo.id', 0))
                let name = get(student, 'studentInfo.name', '')
                let score = get(student, 'finalGrade.score', 0)
                let commentType = get(student, 'finalGrade.attendanceCode', -1)
                let comment = get(student, 'finalGrade.comment', '')

                examsOutput[0].push(
                    <tr key={i}>
                        <td>{name}</td>
                        <td>Final Grade</td>
                        <td>
                            <input
                                name='score'
                                type='text'
                                value={score}
                                className='form-control'
                                onChange={e => this.onFieldChange(e.target, i)}
                            />
                        </td>
                        <td>
                            <CommentTypesSelect
                                name='attendanceCode'
                                options={commentTypes}
                                value={commentType}
                                onChange={e => {
                                    this.onFieldChange(e.target, i)
                                    this.onCommentTypeChange(e.target, i)
                                }}
                            />
                        </td>
                        <td>
                            <input
                                name='comment'
                                type='text'
                                value={comment}
                                className='form-control'
                                onChange={e => this.onFieldChange(e.target, i)}
                            />
                        </td>
                    </tr>
                )

                examResults.forEach((item, j) => {
                    let score = 0
                    let commentType = -1
                    let comment = ''
                    const examId = item.exam.id

                    for (let i = 0; i < item.scores.length; i++) {
                        const scoreObj = item.scores[i]
                        if (parseInt(scoreObj.idCourseStudent) === id) {
                            score = scoreObj.score ? scoreObj.score : score
                            commentType = scoreObj.attendanceCode ? scoreObj.attendanceCode : commentType
                            comment = scoreObj.comment ? scoreObj.comment : comment
                            break
                        }
                    }

                    examsOutput[j + 1].push(
                        <tr key={`${i}-${j}`}>
                            <td>{name}</td>
                            <td>{item.exam.title}</td>
                            <td>
                                <input
                                    name='score'
                                    type='text'
                                    value={score}
                                    className='form-control'
                                    onChange={e => this.onFieldChange(e.target, i, j)}
                                />
                            </td>
                            <td>
                                <CommentTypesSelect
                                    name='attendanceCode'
                                    options={commentTypes}
                                    value={commentType}
                                    onChange={e => {
                                        this.onFieldChange(e.target, i, j)
                                        this.onCommentTypeChange(e.target, i, j)
                                    }}
                                />
                            </td>
                            <td>
                                <input
                                    name='comment'
                                    type='text'
                                    value={comment}
                                    className='form-control'
                                    onChange={e => this.onFieldChange(e.target, i, j)}
                                    />
                            </td>
                        </tr>
                    )
                })
            }
        )

        var rows = []
        for (let i in examsOutput) {
            rows = rows.concat(examsOutput[i])
        }

        return rows
    }

    renderTable() {
        return (
            <table className='table table-striped results-table'>
                <thead>
                <tr>
                    <td>Student</td>
                    <td>Exam</td>
                    <td>Score</td>
                    <td>Comment Type</td>
                    <td>Comment</td>
                </tr>
                </thead>
                <tbody>
                {this.renderBody()}
                </tbody>
            </table>
        )
    }

    render() {
        return (
            <div>
                <div id="notifications"></div>
                {this.renderTable()}
                <Button
                    onClick={this.save}
                    className='custom btn-success'
                    style={{ marginRight: '15px' }}
                >
                    Save
                </Button>
            </div>
        )
    }
}

const Wrapper = RoleFilter(
    DataLoader(ClassExamResults),
    [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.TEACHER, ROLES.REGISTRAR]
)

const CommentTypesSelect = ({ options, value, onChange, name }) => (
    <select
        name={name}
        value={value}
        className='form-control'
        onChange={onChange}
    >
        <option value={-1}>Custom comment</option>
        {options.map((type, i) =>
            <option key={i} value={type.value}>{S.ucFirst(type.label)}</option>
        )}
    </select>
)