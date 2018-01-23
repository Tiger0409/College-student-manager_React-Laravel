import React, { Component, PropTypes } from 'react'
import { ROLES } from './../../../../config/constants.js'
import PromiseHelper from './../../../../utils/PromiseHelper.js'
import Sh from './../../../../utils/StringHelper.js'
import ObjHelper from './../../../../utils/ObjHelper.js'
import CourseHeaderAdmin from './../../../admin/CourseHeaderAdmin.jsx'
import { FormField, LabeledValue, EditableHTML, DatePicker, EditableSourceSelected } from './../../../common/FormWidgets.jsx'
import FormGroup from './../../../common/FormGroup.jsx'
import { Row, Col, Button } from 'react-bootstrap'
import DataLoader from '../../../common/DataLoader.jsx'
import Notifier from '../../../../utils/Notifier.js'
import SelectUserWnd from './SelectUserWnd.jsx'
import { Link } from 'react-router'
import Dh from '../../../../utils/DateHelper.js'
import ConfirmDialog from '../../../common/ConfirmDialog.jsx'
import StripePaymentWnd from '../../../common/StripePaymentWnd.jsx'
import Spinner from '../../../common/Spinner.jsx'
import PaymentsLog from './PaymentsLog'

const get = ObjHelper.getIfExists

let styles = {
    buttonTitle: { float: 'right', marginTop: '20px', marginBottom: '20px', marginLeft: 10, marginRight: 10 }
}

if (window.innerWidth < 768) {
    styles = {
        buttonTitle: { display: 'inline-block', marginTop: 10, marginBottom: 10, marginRight: 10 }
    }   
}

export default class CourseRegEdit extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { isLoading: false, data: {}, showSelectUserWnd: false }
        this.allowedRoles = [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.REGISTRAR]
        this.headerTypes = { [ROLES.ADMIN]: CourseHeaderAdmin }
        this.promises = { save: null, load: null }
        this.isStudentReduced = null
        this.reducedValuesStyle = {}
        this.saved = true
        this.handleFieldChange = this.handleFieldChange.bind(this)
        this.onPaymentsChange = this.onPaymentsChange.bind(this)
        this.changeUser = this.changeUser.bind(this)
        this.submit = this.submit.bind(this)
        this.loadData = this.loadData.bind(this)
        this.deleteStudent = this.deleteStudent.bind(this)
        this.onChange = this.onChange.bind(this)
    }

    isAllowed() {
        const { appTypeKey } = this.props
        return this.allowedRoles.indexOf(appTypeKey) !== -1
    }

    deleteStudent() {
        const { data } = this.state

        if (this.deletePromise) {
            return
        }

        this.deletePromise = PromiseHelper.ajax({
            type: 'delete',
            data: { ids: [data.student.id] },
            url: `/api/students`
        })

        this.deletePromise.then(
            () => {
                this.context.router.push(`/users/${data.student.studentId}`)
                Notifier.success('Class deleted from student')
                this.deletePromise = null
            },
            xhr => { Notifier.error(xhr.responseText); this.deletePromise = null }
        )
    }

    componentWillMount() {
        if (!this.isAllowed()) return

        window.onReactNavigate = () => {
            if (!this.validate(true)) {
                return false
            }

            if (!this.saved) {
                alert('Save before continue please')
                return false
            }

            return true;
        }

        this.loadData()
    }

    componentWillUnmount() {
        for (let key in this.promises) {
            if (this.promises[key]) this.promises[key].cancel()
        }

        window.onReactNavigate = undefined
    }

    changeUser(id) {
        const { router } = this.context
        let { data } = this.state
        data.student.studentId = id
        if (!data.student.adminNotes) {
            data.student.adminNotes = ''
        }

        data.student.adminNotes += `<p>Student moved from old student name(${data.student.user.userFullname})</p>`

        this.saveData(data, () => {
            router.push(`/users/${id}`)
        })
    }

    showHeader() {
        const { appTypeKey } = this.props
        let ConcreteHeader = false
        if (appTypeKey in this.headerTypes)
            ConcreteHeader = this.headerTypes[appTypeKey]

        return (
            <div>
                {ConcreteHeader? <ConcreteHeader selectedTab='/classes' /> : ''}
            </div>
        )
    }

    renderCourseRegEditForm() {
        const { data: { student, studentPayments }, showSelectUserWnd } = this.state
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
                <form id='classEditForm' onSubmit={this.submit}>
                    <div className='content-block'>
                        <h2 className='block-heading'>Edit Course Registration</h2>

                        <div style={styles.buttonTitle}>
                            <Button
                                onClick={this.deleteStudent}
                            >
                                Delete class from student
                            </Button>
                        </div>

                        <div style={styles.buttonTitle}>
                            <Button
                                onClick={() => this.context.router.push(`/users/${get(student, 'user.id')}`)}
                            >
                                Profile
                            </Button>
                        </div>

                        <hr />
                        <Row>
                            <Col md={6}>
                                <p className='detail-field-label'>Course</p>
                                <EditableSourceSelected
                                    activeProps={{
                                        url: '/api/classes/list',
                                        params: { termId: 'active', classGender: get(student, 'user.profile.profileGender') },
                                        defaultOption: 'Select course',
                                        className: 'form-control',
                                        id: 'classSelect',
                                        onChange: this.onChange,
                                        name: 'classId',
                                        value: student.classId
                                    }}
                                    passiveProps={{
                                        value: get(student, 'course.courseTitle')
                                    }}
                                />

                                <LabeledValue
                                    label='Term'
                                    value={get(student, 'courseClass.term.name')}
                                />

                                <LabeledValue
                                    label='Classroom'
                                    value={get(student, 'courseClass.classroom.classroomName')}
                                />

                                <Label>Class time</Label>
                                {this.renderClassOptions()}

                                <LabeledValue
                                    label='Male/Female'
                                    value={get(student, 'courseClass.classGender')}
                                />

                                <FormGroup>
                                    <Row>
                                        <Col md={6}>
                                            <p className='detail-field-label'>Student Name</p>

                                            <Link to={`/users/${get(student, 'user.id')}`}>
                                                {get(student, 'user.userFullname')}
                                            </Link>
                                        </Col>
                                    </Row>
                                </FormGroup>

                                <FormGroup>
                                    <Row>
                                        <Col md={6}>
                                            <p className='detail-field-label'>Teacher Name</p>

                                            <Link to={`/users/${get(student, 'courseClass.teacher.id', 'role/teachers')}`}>
                                                {get(student, 'courseClass.teacher.userFullname', '', 'None')}
                                            </Link>
                                        </Col>
                                    </Row>
                                </FormGroup>

                                <LabeledValue
                                    label='Register Date'
                                    value={student.registerDate}
                                />
                            </Col>

                            <Col md={6}>
                                {this.renderStudentOptions(['regPaymentMethod', 'gradeStatus'])}
                            </Col>
                        </Row>

                        <Label>Admin Notes</Label>
                        <EditableHTML
                            name='adminNotes'
                            value={student.adminNotes}
                            onChange={this.handleFieldChange}
                            onlyEdit
                        />

                        <div>
                            <Button
                                style={{ marginRight: '15px', marginBottom: 15 }}
                                className='custom btn-success'
                                type='submit'
                            >
                                Save
                            </Button>

                            <Button
                                style={{ marginBottom: 15 }}
                                className='custom'
                                onClick={() => this.setState({ showSelectUserWnd: true})}
                            >
                                Change user for this course registration
                            </Button>
                        </div>
                    </div>

                    <div className="content-block">
                        <h2 className='block-heading'>Payments</h2>
                        <hr />

                        {this.renderStudentOptions(['studentStatus'])}

                        <div id='reducedValues' className='row' style={this.reducedValuesStyle}>
                            <FormField label='Reduced amount:' width={4} style={{ marginBottom: 10 }}>
                                <input
                                    name='reducedAmount'
                                    className='form-control'
                                    type='text'
                                    value={student.reducedAmount}
                                    onChange={this.handleFieldChange}
                                />
                            </FormField>

                            <FormField label='Reduced notes:' width={4} style={{ marginBottom: 10 }}>
                                <input
                                    name='reducedNotes'
                                    className='form-control'
                                    type='text'
                                    value={student.reducedNotes}
                                    onChange={this.handleFieldChange}
                                />
                            </FormField>
                        </div>

                        <StudentPayments
                            appTypeKey={this.props.appTypeKey}
                            remainingFee={remainingFee}
                            student={student}
                            payments={studentPayments}
                            onChange={this.onPaymentsChange}
                            onLoadData={this.loadData}
                            onSave={this.submit}
                        />

                        <Row>
                            <Col md={3} style={{ marginBottom: 15 }}>
                                <Label>Total Amount Paid So Far</Label>
                                <input type='text' className='form-control' value={'£ ' + totalPaid} disabled />
                            </Col>

                            <Col md={3} style={{ marginBottom: 15 }}>
                                <Label>Remaining Amount</Label>
                                <input type='text' className='form-control' value={'£ ' + remainingFee} disabled />
                            </Col>
                        </Row>
                    </div>

                    <PaymentsLog appTypeKey={this.props.appTypeKey} params={{ studentId: student.id }} />
                </form>

                <SelectUserWnd
                    show={showSelectUserWnd}
                    headerText='Select new user'
                    onClose={() => this.setState({ showSelectUserWnd: false })}
                    onSelect={this.changeUser}
                />
            </div>
        )
    }

    renderClassOptions() {
        const { student, classOptions } = this.state.data

        return (
            <FormGroup>
                {classOptions.map((option, i) =>
                    <FormGroup key={i}>
                        <input
                            type='radio' name='classId' value={option.id}
                            checked={student.classId == option.id} onChange={this.handleFieldChange}/>
                        {' ' + option.classTime + ' - ' + option.classGender}
                    </FormGroup>
                )}
            </FormGroup>
        )
    }

    renderStudentOptions(selectedGroups) {
        const { student, studentOptions } = this.state.data

        var optionLabels = [
            'Payment Method',
            'Results',
            'Student Status'
        ]
        var optionGroups = []
        var groupKeys = Object.keys(studentOptions)

        if (selectedGroups) {
            groupKeys = groupKeys.filter(group => selectedGroups.indexOf(group) !== -1)
        }

        for (let i = 0; i < groupKeys.length; i++) {
            let groupName = groupKeys[i]

            if (Array.isArray(studentOptions[groupName])) {
                optionGroups.push(
                    <FormGroup key={groupName}>
                        <Label>{optionLabels[i]}</Label>
                        {studentOptions[groupName].map((option, j) => {
                            let optionValue = option.split(' ')[0]

                            return (<div key={j}>
                                <input
                                    type='radio'
                                    name={groupName}
                                    value={optionValue}
                                    checked={student[groupName] == optionValue}
                                    onChange={this.handleFieldChange}
                                />
                                {' ' + Sh.ucWords(option.replace(/_/g, ' '))}
                            </div>)
                        })}
                    </FormGroup>
                )
            } else {
                optionGroups.push(
                    <FormGroup key={groupName}>
                        <Label>{optionLabels[i]}</Label>
                        {Object.keys(studentOptions[groupName]).map((optionValue, j) => {
                            return (<div key={j}>
                                <input
                                    type='radio'
                                    name={groupName}
                                    value={optionValue}
                                    checked={student[groupName] == optionValue}
                                    onChange={this.handleFieldChange}
                                />
                                {' ' + Sh.ucWords(studentOptions[groupName][optionValue].replace(/_/g, ' '))}
                            </div>)
                        })}
                    </FormGroup>
                )
            }
        }

        return optionGroups
    }

    render() {
        if (!this.isAllowed()) return false

        const { isLoading } = this.state

        return (
            <div>
                {this.showHeader()}
                <div id="notifications"></div>
                {isLoading ? <Spinner /> : this.renderCourseRegEditForm()}
            </div>
        )
    }

    validate(showMsg) {
        const { studentPayments } = this.state.data
        const { appTypeKey } = this.props

        const isEmpty = vars => {
            for (let i = 0; i < vars.length; i++) {
                if (typeof vars[i] == 'undefined' || vars[i] == '' || vars[i] == null) {
                    return true
                }
            }
            return false
        }

        for (let i = 0; i < studentPayments.length; i++) {
            const { id, receivedBy, paymentMethod, date, staff, isDeleted } = studentPayments[i]

            if (isEmpty([receivedBy, paymentMethod, date, staff]) && !isDeleted) {
                if (paymentMethod != 'stripe' || ((id && appTypeKey == ROLES.SUPER_ADMIN) || !id)) {
                    showMsg && Notifier.error('All payments fields must be complete')
                    return false
                }
            }
        }

        return true
    }

    submit(e) {
        e.preventDefault()

        if (!this.validate(true)) return false

        const id = ObjHelper.getIfExists(this.state, 'data.student.studentId', null)

        this.saveData(null, () => {
            if (id) {
                this.saved = true
                this.context.router.push(`/users/${id}`)
            }
        })
    }

    onPaymentsChange(payments) {
        var { data } = this.state
        data.studentPayments = payments
        this.saved = false
        this.setState({ data: data })
    }

    handleFieldChange(e) {
        var { data } = this.state
        data.student[e.target.name] = e.target.value
        this.saved = false
        this.setState({ data: data })
    }

    loadData() {
        const { id } = this.props.params
        if (!id) return

        this.setState({ isLoading: true })

        this.promises.load = PromiseHelper.ajax({
            type: 'get',
            url: '/api/students/' + id + '/form-data'
        })
        this.promises.load.then(
            data => {
                data.studentPayments = data.studentPayments.filter(payment => {
                    const value = payment.amount > 0 || payment.isInitial == 0
                    return value
                })
                this.setState({ isLoading: false, data: data })
            },
            xhr => console.log(xhr)
        )
    }

    onClassIdChange(e) {
        let { data } = this.state
        if (data.student.classId != e.target.value) {
            data.student.classId = e.target.value
            this.saveData(data, this.loadData)
        }
    }

    onChange(e) {
        const setMutator = 'on' + Sh.ucFirst(e.target.name) + 'Change'
        if (this[setMutator]) {
            this[setMutator](e)
        } else {
            console.error('default on change behaviour not implemented')
        }
    }

    saveData(data, afterSave) {
        const { id } = this.props.params
        var { student, studentPayments } = data ? data : this.state.data

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
                    classId: student.classId,
                    regStatus: student.regStatus,
                    adminNotes: student.adminNotes,
                    studentStatus: student.studentStatus,
                    regPaymentStatus: student.regPaymentStatus,
                    paymentMethod: student.paymentMethod,
                    regPaymentMethod: student.regPaymentMethod,
                    reducedAmount: student.reducedAmount,
                    reducedNotes: student.reducedNotes,
                    gradeStatus: student.gradeStatus,
                },
                studentPayments: studentPayments
            },
            success: data => {
                if (afterSave) {
                    afterSave()
                }

                this.setState({ data: data })

                Notifier.success('Saved successfully')
            },
            error: xhr => {
                Notifier.error('Save failed')
                Notifier.error(xhr.responseText)
                console.error(xhr)
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
        //totalPaid += parseFloat(student.totalAmount)
        return totalPaid
    }

    getFee() {
        let fee = 0
        const { student } = this.state.data
        switch (student.studentStatus) {
            case 'employed':
                fee = student.courseClass.feeForEmployed >= 0 ?
                    student.courseClass.feeForEmployed : student.course.feeForEmployed
                break
            case 'unemployed':
                fee = student.courseClass.feeForUnemployed >= 0 ?
                    student.courseClass.feeForUnemployed : student.course.feeForUnemployed
                break
            case 'reduced':
                fee = student.reducedAmount ? student.reducedAmount : 0
                break
        }

        return fee
    }
}

CourseRegEdit.propTypes = {
    appTypeKey: PropTypes.string.isRequired
}

CourseRegEdit.contextTypes = {
    router: PropTypes.object.isRequired
}

const StudentPayments = DataLoader(
    class extends Component {
        constructor(props, context) {
            super(props, context)
            this.state = {
                payments: props.payments,
                paymentMethods: props.data,
                showDeletePayment: false,
                idToDelete: null,
                showStripeForm: false
            }
            this.add = this.add.bind(this)
            this.change = this.change.bind(this)
        }

        render() {
            const { showStripeForm } = this.state
            const { student } = this.props

            return (
                <div style={{ marginBottom: '20px' }}>
                    {this.renderTable()}
                    <Button
                        className='custom btn-success'
                        onClick={this.add}
                        style={{ marginRight: '15px' }}
                    >
                        Add New Payment
                    </Button>

                    <Button
                        className='custom btn-success'
                        style={{ marginRight: '15px' }}
                        onClick={() => this.setState({ showStripeForm: true })}
                    >
                        Take Card Payment
                    </Button>

                    <Button
                        style={{ marginRight: '15px' }}
                        className='custom btn-success'
                        type='submit'
                    >
                        Save
                    </Button>

                    <StripePaymentWnd
                        show={showStripeForm}
                        onClose={update => {
                            this.setState({ showStripeForm: false })
                            if (update) {
                                this.props.onLoadData()
                            }
                        }}
                        studentId={student.id}
                    />
                </div>
            )
        }

        getPaymentsCount() {
            const { payments } = this.state
            var count = 0
            payments.forEach(item => {
                if (!item.isDeleted) count++
            })
            return count
        }

        renderTable() {
            const { payments, showDeletePayment } = this.state
            const { student } = this.props
            if (!payments || this.getPaymentsCount() === 0) {
                return <h3>No payments yet</h3>
            }

            return (
                <div>
                    <div className='table-responsive'>
                        <table className='table table-striped results-table' style={{ minWidth: 768 }}>
                            <thead>
                            <tr>
                                <td>Received by</td>
                                <td>Payment Method</td>
                                <td>Date</td>
                                <td>Amount</td>
                                <td>Staff</td>
                                <td></td>
                            </tr>
                            </thead>
                            <tbody>
                            {this.renderRows()}
                            </tbody>
                        </table>
                    </div>

                    <ConfirmDialog
                        headerText='Delete payment'
                        confirmText='Are you sure?'
                        onYes={() => { this.delete(); this.setState({ showDeletePayment: false }) }}
                        onNo={() => this.setState({ showDeletePayment: false })}
                        show={showDeletePayment}
                    />
                </div>
            )
        }

        renderRows() {
            const { payments, paymentMethods } = this.state
            const { student, appTypeKey } = this.props

            let rows = []

            // unneeded now, because of initial payments
            if (parseInt(student.totalAmount) > 0) {
                rows.push(
                    <StudentPaymentRow
                        key='initial'
                        paymentMethods={paymentMethods}
                        payment={{
                            receivedBy: student.paymentMethod,
                            paymentMethod: student.paymentMethod,
                            date: Dh.dateToStr(new Date()),
                            amount: student.totalAmount,
                            staff: student.invoiceId ? 'paypal' : 'cash'
                        }}
                        disabled
                    />
                )
            }
            if (payments) {
                rows = rows.concat(payments.map((payment, i) => {
                    if (payment.isDeleted) return false

                    const isSavedStripePayment =
                        ((payment.paymentMethod == 'stripe') && payment.id && (appTypeKey != ROLES.SUPER_ADMIN))

                    return (
                        <StudentPaymentRow
                            key={i}
                            index={i}
                            payment={payment}
                            onDelete={() => this.setState({ idToDelete: i, showDeletePayment: true })}
                            onChange={(name, value) => this.change(i, name, value)}
                            paymentMethods={paymentMethods}
                            disabled={isSavedStripePayment}
                            undeletable={isSavedStripePayment}
                        />
                    )
                }))
            }

            return rows
        }

        add() {
            var { payments, paymentMethods } = this.state
            const { remainingFee, student } = this.props

            payments.push({
                instalmentId: 0,
                date: null,
                amount: '',
                staff: '',
                courseStudentId: student.id,
                paymentMethod: ''
            })
            this.setState({ payments: payments })
            this.props.onChange(payments)
        }

        delete() {
            var { payments, idToDelete: index } = this.state
            if (payments[index].id) {
                payments[index].isDeleted = true
            } else {
                payments.splice(index, 1)
            }

            this.setState({ payments: payments })
            this.props.onChange(payments)
        }

        change(index, name, value) {
            var { payments } = this.state
            payments[index][name] = value
            this.setState({ payments: payments })
            this.props.onChange(payments)
        }
    },
    { load: { type: 'get', url: '/api/student-payments/get-payment-method-enum' } }
)

StudentPayments.PropTypes = {
    remainingFee: PropTypes.number,
    student: PropTypes.object,
    payments: PropTypes.arrayOf(PropTypes.object),
    onChange: PropTypes.func.isRequired
}

class StudentPaymentRow extends Component {
    constructor(props, context) {
        super(props, context)
        this.onChange = this.onChange.bind(this)
        this.delete = this.delete.bind(this)
        this.handleDateChange = this.handleDateChange.bind(this)
    }

    componentDidMount() {
        const { index } = this.props
        DatePicker.init(
            this.handleDateChange,
            { selector: `#payment-datepicker-${index}` }
        )
    }

    handleDateChange() {
        let name, value

        switch (arguments.length) {
            case 1:
                const e = arguments[0]
                name = e.target.name
                value = e.target.value
                break
            case 2:
                name = arguments[0]
                value = arguments[1]
                break
        }

        this.onChange(name, this.formatDate(value, 'yyyy-mm-dd'))
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

    render() {
        const { instalmentId, id, receivedBy, paymentMethod, date, amount, staff } = this.props.payment
        const { paymentMethods, disabled, undeletable, index } = this.props

        return (
            <tr>
                <td>
                    <input
                        type='text' value={receivedBy} name='receivedBy'
                        className='form-control' onChange={this.onChange} disabled={disabled}
                    />
                </td>

                <td>
                    <select
                        className='form-control'
                        name='paymentMethod'
                        id='paymentMethod'
                        value={paymentMethod}
                        onChange={this.onChange}
                        disabled={disabled}
                    >
                        <option value="">Select method</option>
                        {
                            paymentMethods ? paymentMethods.map(
                                    (item, i) => (
                                        <option key={i} value={item.value}>{item.label}</option>
                                    )
                                ) : ''
                        }
                    </select>
                </td>

                <td>
                    <input
                        value={this.formatDate(date, 'dd-mm-yyyy')}
                        name='date'
                        id={`payment-datepicker-${index}`}
                        className='form-control datepicker'
                        onChange={this.handleDateChange}
                        disabled={disabled}
                    />
                </td>

                <td>
                    <input
                        type='text' value={amount} name='amount'
                        className='form-control' onChange={this.onChange}
                        disabled={disabled}
                    />
                </td>

                <td>
                    <input
                        type='text' value={staff} name='staff'
                        className='form-control' onChange={this.onChange}
                        disabled={(paymentMethod != 'stripe') && disabled}
                    />
                </td>

                <td>
                    {(!disabled && !undeletable) ?
                        <Button bsStyle='danger' onClick={this.delete}>Delete</Button>
                        : ''
                    }
                </td>
            </tr>
        )
    }

    delete() {
        this.props.onDelete()
    }

    onChange() {
        let name, value

        switch (arguments.length) {
            case 1:
                const e = arguments[0]
                name = e.target.name
                value = e.target.value
                break
            case 2:
                name = arguments[0]
                value = arguments[1]
                break
        }

        this.props.onChange(name, value)
    }
}
StudentPaymentRow.PropTypes = {
    payment: PropTypes.shape({
        id: PropTypes.number,
        instalmentId: PropTypes.number,
        date: PropTypes.string.isRequired,
        amount: PropTypes.number.isRequired,
        staff: PropTypes.string.isRequired
    }).isRequired,
    onDelete: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired
}

const Label = ({ children }) => (<p className='detail-field-label'>{children}</p>)