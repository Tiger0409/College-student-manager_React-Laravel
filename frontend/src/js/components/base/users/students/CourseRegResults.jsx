import React, { Component, PropTypes } from 'react'
import { ROLES } from './../../../../config/constants.js'
import PromiseHelper from './../../../../utils/PromiseHelper.js'
import S from './../../../../utils/StringHelper.js'
import ObjHelper from './../../../../utils/ObjHelper.js'
import CourseHeaderAdmin from './../../../admin/CourseHeaderAdmin.jsx'
import { FormField, LabeledValue, EditableHTML } from './../../../common/FormWidgets.jsx'
import FormGroup from './../../../common/FormGroup.jsx'
import { Button, Row, Col } from 'react-bootstrap'
import DataLoader from '../../../common/DataLoader.jsx'
import Notifier from '../../../../utils/Notifier.js'
import Spinner from '../../../common/Spinner'

export default class CourseRegResults extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { isLoading: false, data: {} }
        this.allowedRoles = [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.REGISTRAR]
        this.headerTypes = {
            [ROLES.ADMIN]: CourseHeaderAdmin,
            [ROLES.SUPER_ADMIN]: CourseHeaderAdmin,
            [ROLES.REGISTRAR] : CourseHeaderAdmin
        }
        this.promises = { save: null, load: null }
        this.handleFieldChange = this.handleFieldChange.bind(this)
        this.onPaymentsChange = this.onPaymentsChange.bind(this)
        this.isStudentReduced = null
        this.reducedValuesStyle = {}
    }

    isAllowed() {
        const { appTypeKey } = this.props
        return this.allowedRoles.indexOf(appTypeKey) !== -1
    }

    componentWillMount() {
        if (!this.isAllowed()) return

        this.loadData()
    }

    componentWillUnmount() {
        for (let key in this.promises)
            if (this.promises[key]) this.promises[key].cancel()
    }

    showHeader() {
        const { appTypeKey } = this.props
        if (appTypeKey in this.headerTypes)
            var ConcreteHeader = this.headerTypes[appTypeKey]

        return (
            <div>
                <ConcreteHeader selectedTab='/classes' />
            </div>
        )
    }

    renderCourseRegEditForm() {
        const { student, studentOptions } = this.state.data
        const studentId = this.props.params.id
        var totalPaid = this.getTotalPaid()
        var remainingFee = Math.max(this.getFee() - totalPaid, 0)

        if (this.isStudentReduced === null) {
            this.isStudentReduced = student.studentStatus == 'reduced'
            this.reducedValuesStyle.display = this.isStudentReduced ?
                'block' : 'none';
        } else if (this.isStudentReduced !== (student.studentStatus == 'reduced')) {
            this.isStudentReduced = !this.isStudentReduced
            $('#reducedValues').slideToggle('slow')
        }

        return (
            <div>
                <div id="notifications"></div>

                <form id='classEditForm' onSubmit={e => this.submit(e)}>
                    <div className='content-block'>
                        <h2 className='block-heading'>Course Registration Info</h2>
                        <hr />
                        <Row>
                            <Col md={6}>
                                <LabeledValue
                                    label='Course'
                                    value={ObjHelper.accessObjByPath(student, 'course.courseTitle')}
                                    width={12}
                                />

                                <LabeledValue
                                    label='Term'
                                    value={ObjHelper.accessObjByPath(student, 'courseClass.term.name')}
                                    width={12}
                                />

                                <LabeledValue
                                    label='Classroom'
                                    value={ObjHelper.accessObjByPath(student, 'courseClass.classroom.classroomName')}
                                    width={12}
                                />

                                {this.renderClassTime()}

                                <LabeledValue
                                    label='Male/Female'
                                    value={ObjHelper.accessObjByPath(student, 'courseClass.classGender')}
                                    width={12}
                                />
                            </Col>

                            <Col md={6}>
                                <LabeledValue
                                    label='Registration status'
                                    value={student.regStatus}
                                    width={12}
                                />

                                <LabeledValue
                                    label='Payment Status'
                                    value={student.regPaymentStatus}
                                    width={12}
                                />

                                <LabeledValue
                                    label='Payment Method'
                                    value={student.regPaymentMethod}
                                    width={12}
                                />

                                <LabeledValue
                                    label='Student Status'
                                    value={student.studentStatus}
                                    width={12}
                                />

                                <LabeledValue
                                    label='Student Name'
                                    value={ObjHelper.accessObjByPath(student, 'user.userFullname')}
                                    width={12}
                                />
                            </Col>
                        </Row>

                        <Label>Admin Notes</Label>
                        <EditableHTML
                            name='adminNotes'
                            value={student.adminNotes}
                            onChange={this.handleFieldChange}
                            onlyEdit
                        />

                        <FormField width={3} label='Total Amount Paid So Far'>
                            <input type='text' className='form-control' value={'£ ' + totalPaid} disabled />
                        </FormField>

                        <h2 className='block-heading'>Exams</h2>
                        <hr />

                        <Exams student={student} onChange={this.handleFieldChange} />

                        <FormGroup>
                            <p style={{fontWeight: 'bold'}}>Final Grade</p>
                            {studentOptions['gradeStatus'].map((option, j) => {
                                let optionValue = option.split(' ')[0]

                                return (<div key={j}>
                                    <input
                                        type='radio' name='gradeStatus' value={optionValue}
                                        checked={student['gradeStatus'] == optionValue} onChange={this.handleFieldChange}/>
                                    {' ' + S.ucWords(option.replace(/_/g, ' '))}
                                </div>)
                            })}
                        </FormGroup>

                        <FormGroup>
                            <Button className='custom btn-success' type='submit'>Save</Button>
                        </FormGroup>
                    </div>
                </form>
            </div>
        )
    }

    renderClassTime() {
        const { student, classOptions } = this.state.data

        for (let i = 0; i < classOptions.length; i++) {
            let option = classOptions[i]

            if (student.classId == option.id) {
                return (
                    <LabeledValue
                        label='Class time'
                        value={' ' + option.classTime + ' - ' + option.classGender}
                    />
                )
            }
        }

        return false
    }

    renderStudentOptions() {
        const { student, studentOptions } = this.state.data

        var optionLabels = [
            'Payment Method',
            'Student Status'
        ]
        var optionGroups = []
        var groupKeys = Object.keys(studentOptions)
        for (let i = 0; i < groupKeys.length; i++) {
            let groupName = groupKeys[i]

            optionGroups.push(
                <FormGroup key={groupName}>
                    <p style={{fontWeight: 'bold'}}>{optionLabels[i]}</p>
                    {studentOptions[groupName].map((option, j) => {
                        let optionValue = option.split(' ')[0]

                        return (<div key={j}>
                            <input
                                type='radio' name={groupName} value={optionValue}
                                checked={student[groupName] == optionValue} onChange={this.handleFieldChange}/>
                            {' ' + S.ucWords(option.replace(/_/g, ' '))}
                        </div>)
                    })}
                </FormGroup>
            )
        }

        return optionGroups
    }

    render() {
        if (!this.isAllowed()) return false

        const { isLoading } = this.state

        if (isLoading) return (<div>{this.showHeader()}<p>Loading...</p></div>)

        return (
            <div>
                {this.showHeader()}
                {this.renderCourseRegEditForm()}
            </div>
        )
    }

    submit(e) {
        e.preventDefault()
        this.saveData()
    }

    onPaymentsChange(payments) {
        var { data } = this.state
        data.studentPayments = payments
        this.setState({ data: data })
    }

    handleFieldChange(e) {
        var { data } = this.state
        data.student[e.target.name] = e.target.value
        this.setState({ data: data })
    }

    loadData() {
        const { id } = this.props.params
        if (!id) return

        this.setState({isLoading: true})

        this.promises.load = PromiseHelper.ajax({
            type: 'get',
            url: '/api/students/' + id + '/form-data'
        })
        this.promises.load.then(
            data => this.setState({ isLoading: false, data: data }),
            xhr => console.log(xhr)
        )
    }

    saveData() {
        const { id } = this.props.params
        var { student, studentPayments } = this.state.data

        if (student.studentStatus !== 'reduced') {
            student.reducedAmount = 0
            student.reducedNotes = ''
        }

        $.ajax({
            type: 'post',
            url: '/api/students/' + id + '/submit-form-data',
            data: {
                student: {
                    studentId: student.studentId,
                    adminNotes: student.adminNotes,
                    feedback: student.feedback,
                    gradeStatus: student.gradeStatus,
                    score: student.score,
                    attendanceCode: student.attendanceCode,
                    scores: student.scores
                },
                studentPayments: studentPayments
            },
            success: () => Notifier.success('Saved successfully'),
            error: xhr => {
                Notifier.error('Save failed')
                console.log(xhr)
            }
        })
    }

    getTotalPaid() {
        const { student, studentPayments } = this.state.data
        var totalPaid = 0
        studentPayments.forEach(payment => {
            if (payment.isDeleted) return

            let paymentAmount = parseFloat(payment.amount)
            if (!isNaN(paymentAmount))
                totalPaid += paymentAmount
        })

        return totalPaid
    }

    getFee() {
        var fee = 0
        const { student } = this.state.data
        switch (student.studentStatus) {
            case 'employed':
                fee = student.courseClass.feeForEmployed >= 0 ?
                    student.courseClass.feeForEmployed : student.course.feeForEmployed
                break
            case 'unemployed':
                fee = student.courseClass.feeForUnemployed >= 0
                    ? student.courseClass.feeForUnemployed : student.course.feeForUnemployed
                break
        }
        return fee
    }
}
CourseRegResults.PropTypes = {
    appTypeKey: PropTypes.string.isRequired
}

class Exams extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { isLoading: false, commentTypes: [], bank: [] }
        this.onCommentTypeSelect = this.onCommentTypeSelect.bind(this)
        this.loadCommentsBank = this.loadCommentsBank.bind(this)
        this.loadCommentTypes = this.loadCommentTypes.bind(this)
        this.load = this.load.bind(this)
        this.onChange = this.onChange.bind(this)
        this.onExamChange = this.onExamChange.bind(this)
    }

    updateField(name, value) {

    }

    onCommentTypeSelect() {
        let onChange = null
        let e = null
        let commentField = null

        switch (arguments.length) {
            case 1:
                onChange = this.onChange
                e = arguments[0]
                commentField = 'feedback'
                break

            case 2:
                onChange = e => this.onExamChange(arguments[0], e)
                e = arguments[1]
                commentField = 'comment'
                break
        }

        onChange(e)
        const { value: feedbackCode } = e.target
        const { bank } = this.state

        const comments = bank.filter(item => item.feedbackCode == feedbackCode)
        const comment = comments.length > 0 ?
            comments[Math.floor(Math.random() * comments.length)].feedbackDescription : ''

        onChange({ target: { name: commentField, value: comment }})
    }

    onChange(e) {
        const { onChange } = this.props
        onChange(e)
    }

    onExamChange(i, e) {
        let { student: { scores }, onChange } = this.props
        let { name, value } = e.target
        scores[i][name] = value
        onChange({ target: { name: 'scores', value: scores }})
    }

    loadCommentTypes(onLoad) {
        $.ajax({
            type: 'get',
            url: '/api/lookup/get-attendance-level',
            success: data => {
                this.setState({ commentTypes: data })
                onLoad()
            },
            error: xhr => {
                console.error(xhr)
                Notifier.error(xhr.responseText)
                onLoad()
            }
        })
    }

    loadCommentsBank(onLoad) {
        $.ajax({
            type: 'get',
            url: '/api/bank',
            success: data => {
                this.setState({ bank: data })
                onLoad()
            },
            error: xhr => {
                console.error(xhr)
                Notifier.error(xhr.responseText)
                onLoad()
            }
        })
    }

    load(onLoad) {
        let loaders = [this.loadCommentTypes, this.loadCommentsBank]
        let loadings = loaders.length
        const onSubLoad = () => {
            if (--loadings == 0) {
                onLoad()
            }
        }

        loaders.forEach(loader => loader(onSubLoad))
    }

    componentDidMount() {
        this.setState({ isLoading: true })
        this.load(() => this.setState({ isLoading: false }))
    }

    renderBody() {
        const { commentTypes } = this.state
        const { student } = this.props
        const get = ObjHelper.getIfExists
        const finalGradeCommentType = get(student, 'attendanceCode', -1)
        const finalGradeScore = get(student, 'score', 0)
        const finalGradeComment = get(student, 'feedback', '')

        let rows = []
        rows.push(
            <tr key={rows.length}>
                <td>Final Grade</td>
                <td>
                    <input
                        type='text'
                        className='form-control'
                        name='score'
                        value={finalGradeScore}
                        onChange={this.onChange}
                    />
                </td>
                <td>
                    <CommentTypesSelect
                        name='attendanceCode'
                        options={commentTypes}
                        value={finalGradeCommentType}
                        onChange={this.onCommentTypeSelect}
                    />
                </td>
                <td>
                    <input
                        type='text'
                        className='form-control'
                        name='feedback'
                        value={finalGradeComment}
                        onChange={this.onChange}
                    />
                </td>
            </tr>
        )

        for (let i = 0; i < student.scores.length; i++) {
            let exam = student.scores[i]
            let title = get(exam, 'examTitle', '')
            let score = get(exam, 'score', 0)
            let commentType = get(exam, 'attendanceCode', -1)
            let comment = get(exam, 'comment', '')

            rows.push(
                <tr key={rows.length}>
                    <td>{title}</td>
                    <td>
                        <input
                            type='text'
                            className='form-control'
                            name='score'
                            value={score}
                            onChange={e => this.onExamChange(i, e)}
                        />
                    </td>
                    <td>
                        <CommentTypesSelect
                            name='attendanceCode'
                            options={commentTypes}
                            value={commentType}
                            onChange={e => this.onCommentTypeSelect(i, e)}
                        />
                    </td>
                    <td>
                        <input
                            type='text'
                            className='form-control'
                            name='comment'
                            value={comment}
                            onChange={e => this.onExamChange(i, e)}
                        />
                    </td>
                </tr>
            )
        }

        return rows
    }

    render() {
        if (this.state.isLoading) return <Spinner />

        return (
            <table className='table table-striped results-table'>
                <thead>
                <tr>
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
}

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

const Label = ({ children }) => (<p className='detail-field-label'>{children}</p>)