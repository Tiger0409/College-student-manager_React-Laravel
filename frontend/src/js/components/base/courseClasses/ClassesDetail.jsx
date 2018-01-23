import React, { PropTypes, Component } from 'react'
import CourseHeaderAdmin from './../../admin/CourseHeaderAdmin.jsx'
import { ROLES } from './../../../config/constants.js'
import PromiseHelper from './../../../utils/PromiseHelper.js'
import O from './../../../utils/ObjHelper.js'
import Dh from './../../../utils/DateHelper.js'
import S from './../../../utils/StringHelper.js'
import ClassExams from './ClassExams.jsx'
import { Row, Col, Tabs, Tab, Button, Panel } from 'react-bootstrap'
import { LabeledValue, EditableValue, FormField, EditableSourceSelected } from './../../common/FormWidgets.jsx'
import SourceSelect from './../../common/SourceSelect.jsx'
import Table from './../../common/Table.jsx'
import { Link } from 'react-router'
import SendEmailWindow from './SendEmailWindow.jsx'
import Switchable from '../../common/Switchable.jsx'
import Notifier from '../../../utils/Notifier.js'
import autosize from '../../../libs/autosize.js'
import Spinner from '../../common/Spinner.jsx'

let styles = {
    backButton: { float: 'right', marginTop: 20, marginBottom: 20, marginRight: 20 },
    formCol: { marginBottom: 15 },
    addStudentExamResult: { marginBottom: 10 },
    sendEmailButton: { marginTop: 25, marginBottom: 15 }
}

if (window.innerWidth < 768) {
    styles = {
        backButton: { marginTop: 10, marginBottom: 10 },
        formCol: { marginBottom: 15 },
        addStudentExamResult: { marginBottom: 10, width: '100%' },
        sendEmailButton: { width: '100%', marginTop: 15, marginBottom: 15 }
    }
} else if (window.innerWidth < 1025) {
    styles = Object.assign({}, styles, {
        addStudentExamResult: { width: '100%', marginBottom: 10 },
        sendEmailButton: { width: '100%', marginTop: 15, marginBottom: 15 }
    })
}

export default class ClassesDetail extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            isLoading: false,
            classObj: {},
            showSendEmailWindow: false
        }
        this.allowedRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.REGISTRAR]
        this.headerTypes = {
            [ROLES.SUPER_ADMIN]: CourseHeaderAdmin,
            [ROLES.ADMIN]: CourseHeaderAdmin
        }
        this.promises = {save: null, load: null}
        this.requestFields = [
            'id',
            'teacher.userFullname',
            'classroom.classroomName',
            'teacherId',
            'courseId',
            'classroomId',
            'courseClassTermId',
            'term.name',
            'classTime',
            'courseClassCapacity',
            'courseClassRegistrationOpen',
            'classDescription',
            'classGender',
            'submitted',
            'course.id',
            'feeForEmployed',
            'feeForUnemployed',
            'course.feeForEmployed',
            'course.feeForUnemployed',
            'course.deptId',
            'course.dept.deptName',
            'course.dept.deptBranchId',
            'course.dept.branchAssociated.branchName',
            'course.courseTitle',
            'classWeight',
            'classDescription',
            'classKey',
            'classKeyCode',
            'classGroupId',
            'submitted',
            'receiptEmailBody',
            'receiptEmailSubject',
            'receiptTemplate'
        ]
        this.goToExamResults = this.goToExamResults.bind(this)
        this.onFieldChange = this.onFieldChange.bind(this)
        this.onChange = this.onChange.bind(this)
        this.onTextChange = this.onTextChange.bind(this)
        this.onDeptChange = this.onDeptChange.bind(this)
    }

    componentWillMount() {
        this.load()
    }

    componentWillUnmount() {
        for (let key in this.promises) {
            if (this.promises[key]) this.promises[key].cancel()
        }
    }

    goToExamResults() {
        const { id }  = this.props.params
        const { router } = this.context

        router.push(`/classes/${id}/students`)
    }

    load() {
        const { id } = this.props.params
        if (!id) return

        this.setState({isLoading: true})

        this.promises.load = PromiseHelper.ajax({
            type: 'get',
            url: '/api/classes/' + id,
            data: {
                fields: this.requestFields
            }
        })
        this.promises.load.then(
            data => {
                let empty = o => !o || o.length === 0

                const useDefaultReceipt =
                    empty(data.receiptEmail) && empty(data.receiptEmailSubject) && empty(data.receiptTemplate)

                this.setState({ isLoading: false, classObj: data, useDefaultReceipt: useDefaultReceipt.toString() })

                $(() => {
                    autosize('textarea')
                })
            },
            xhr => console.log(xhr)
        )
    }

    isAllowed() {
        const { appTypeKey } = this.props
        return this.allowedRoles.indexOf(appTypeKey) !== -1
    }

    printRegisters(type) {
        const { classObj: { id } } = this.state
        this.context.router.push(`/classes/${id}/print/${type}-registers`)
    }

    renderHeader() {
        const { classObj } = this.state

        let courseTitle = O.accessObjByPath(classObj, 'course.courseTitle')
        var headerText = courseTitle && courseTitle.length > 0 ?
            'Class Detail for ' + courseTitle : 'Class Detail'

        return (
            <div>
                <div id="notifications"></div>
                <h2 className='block-heading'>{headerText}</h2>

                <div style={styles.backButton}>
                    <Button
                        onClick={() => this.context.router.goBack()}
                    >
                        Back
                    </Button>
                </div>

                <hr />
            </div>
        )
    }

    updateClassField(prop, value, notify, updateState) {
        if (typeof notify === 'undefined') {
            notify = true
        }

        if (typeof updateState === 'undefined') {
            updateState = true
        }

        const { classObj } = this.state

        $.ajax({
            type: 'put',
            url: `/api/classes/${classObj.id}`,
            data: { [prop]: value , requestFields: this.requestFields },
            success: newClassObj => {
                if (notify) {
                    Notifier.success('Class updated successfully')
                }

                if (updateState) {
                    this.setState({ classObj: newClassObj })
                }
            },
            error: xhr => {
                if (notify) {
                    Notifier.error('Error updating class')
                }
                console.log(xhr)
            }
        })
    }

    onFieldChange(prop, value) {
        let { classObj } = this.state
        classObj[prop] = value
        this.setState({ classObj: classObj })
        this.updateClassField(prop, value)
    }

    clearReceiptOverride() {
        let { classObj } = this.state
        classObj.receiptEmailBody = null
        classObj.receiptEmailSubject = null
        classObj.receiptTemplate = null
        this.setState({ classObj: classObj })
        this.updateClassField('receiptEmailBody', null)
        this.updateClassField('receiptEmailSubject', null, false)
    }

    onChange(e) {
        this.onFieldChange(e.target.name, e.target.value)
    }

    onTextChange(e) {
        const { name, value } = e.target
        let classObj = Object.assign({}, this.state.classObj)
        classObj[name] = value
        this.setState({ classObj: classObj })

        if (this.updateTimeout) clearTimeout(this.updateTimeout)
        this.updateTimeout = setTimeout(() => this.updateClassField(name, value, false, false), 5000)
    }

    onDeptChange(e) {
        const { classObj, classObj: { course } } = this.state

        $.ajax({
            type: 'post',
            url: `/api/courses/${course.id}`,
            data: {
                data: { deptId: e.target.value },
                fields: ['deptId', 'dept.deptName']
            },
            success: newCourse => {
                course.deptId = newCourse.deptId
                course.dept.deptName = newCourse.dept.deptName
                classObj.course = course
                this.setState({ classObj: classObj })
                Notifier.success('Course dept changed')
            },
            error: xhr => {
                Notifier.error(xhr.responseText.replace(/"/g, ''))
            }
        })
    }

    renderDetail() {
        const { classObj, useDefaultReceipt } = this.state
        const { branchId, website } = this.context
        const get = O.getIfExists

        const getFeeForEmployed = () => {
            const classFee = parseFloat(classObj.feeForEmployed)
            return (classFee >= 0 ? classFee : parseFloat(get(classObj, 'course.feeForEmployed', 0))).toFixed(2)
        }

        const getFeeForUnemployed = () => {
            const classFee = parseFloat(classObj.feeForUnemployed)
            return (classFee >= 0 ? classFee : parseFloat(get(classObj, 'course.feeForUnemployed', 0))).toFixed(2)
        }

        return (
            <div>
                <Row>
                    <Col md={4} style={styles.formCol}>
                        <FieldLabel>Dept</FieldLabel>
                        <EditableSourceSelected
                            activeProps={{
                                url: '/api/depts/list',
                                params: { branchId: branchId },
                                defaultOption: 'Select dept',
                                className: 'form-control',
                                id: 'deptSelect',
                                onChange: this.onDeptChange,
                                name: 'deptId',
                                value: get(classObj, 'course.deptId')
                            }}
                            passiveProps={{
                                value: get(classObj, 'course.dept.deptName')
                            }}
                        />
                    </Col>

                    <Col md={4} style={styles.formCol}>
                        <FieldLabel>Course</FieldLabel>
                        <EditableSourceSelected
                            activeProps={{
                                url: '/api/courses/list',
                                params: { branchId: branchId },
                                defaultOption: 'Select course',
                                className: 'form-control',
                                id: 'courseSelect',
                                onChange: this.onChange,
                                name: 'courseId',
                                value: classObj.courseId
                            }}
                            passiveProps={{
                                value: get(classObj, 'course.courseTitle')
                            }}
                        />
                    </Col>

                    <Col md={4} style={styles.formCol}>
                        <FieldLabel>Teacher</FieldLabel>
                        <EditableSourceSelected
                            activeProps={{
                                url: `/api/users/${ROLES.TEACHER}/list`,
                                params: { gender: classObj.classGender },
                                className: 'form-control',
                                id: 'teacherSelect',
                                onChange: this.onChange,
                                name: 'teacherId',
                                value: classObj.teacherId
                            }}
                            passiveProps={{
                                value: get(classObj, 'teacher.userFullname'),
                                defaultValue: 'teacher'
                            }}
                        />
                    </Col>
                </Row>

                <Row>
                    <Col md={4} style={styles.formCol}>
                        <FieldLabel>Classroom</FieldLabel>
                        <EditableSourceSelected
                            activeProps={{
                                url: `/api/classrooms/list`,
                                params: { branchId: get(classObj, 'course.dept.deptBranchId', null) },
                                defaultOption: 'Select classroom',
                                className: 'form-control',
                                id: 'classroomSelect',
                                onChange: this.onChange,
                                name: 'classroomId',
                                value: classObj.classroomId
                            }}
                            passiveProps={{
                                value: get(classObj, 'classroom.classroomName'),
                                defaultValue: 'classroom'
                            }}
                        />
                    </Col>

                    <Col md={4} style={styles.formCol}>
                        <FieldLabel>Term</FieldLabel>
                        <EditableSourceSelected
                            activeProps={{
                                url: `/api/terms/list`,
                                className: 'form-control',
                                id: 'termSelect',
                                onChange: this.onChange,
                                name: 'courseClassTermId',
                                value: classObj.courseClassTermId
                            }}
                            passiveProps={{
                                value: get(classObj, 'term.name'),
                                defaultValue: 'term'
                            }}
                        />
                    </Col>

                    <Col md={4} style={styles.formCol}>
                        <FieldLabel>Class Time</FieldLabel>
                        <EditableValue
                            value={classObj.classTime}
                            onFieldChange={this.onFieldChange}
                            noValueText='class time'
                        >
                            <input type='text' className='form-control' name='classTime' />
                        </EditableValue>
                    </Col>
                </Row>

                <Row>
                    <Col md={4} style={styles.formCol}>
                        <FieldLabel>Gender</FieldLabel>
                        <EditableValue
                            value={classObj.classGender}
                            onFieldChange={this.onFieldChange}>
                            <select
                                className='form-control'
                                name='classGender'
                                id='genderSelect'
                            >
                                <option value='male'>Male</option>
                                <option value='female'>Female</option>
                                <option value='both'>Both</option>
                            </select>
                        </EditableValue>
                    </Col>

                    <Col md={4} style={styles.formCol}>
                        <EditableValue
                            label={`Fee For ${website.paymentField1}`}
                            value={getFeeForEmployed()}
                            onFieldChange={(prop, value) => {
                                if (value == '') value = -1
                                this.onFieldChange(prop, value)
                            }}
                            enableExternalUpdates
                        >
                            <input type="text" className='form-control' name='feeForEmployed' />
                        </EditableValue>
                    </Col>

                    <Col md={4} style={styles.formCol}>
                        <EditableValue
                            label={`Fee For ${website.paymentField2}`}
                            value={getFeeForUnemployed()}
                            onFieldChange={(prop, value) => {
                                if (value == '') value = -1
                                this.onFieldChange(prop, value)
                            }}
                            enableExternalUpdates
                        >
                            <input type="text" className='form-control' name='feeForUnemployed' />
                        </EditableValue>
                    </Col>
                </Row>

                <Row>
                    <Col md={4} style={styles.formCol}>
                        <FieldLabel>Capacity</FieldLabel>
                        <EditableValue
                            value={classObj.courseClassCapacity}
                            onFieldChange={this.onFieldChange}
                            noValueText='capacity'
                        >
                            <input type='text' className='form-control' name='courseClassCapacity' />
                        </EditableValue>
                    </Col>

                    <Col md={4} style={styles.formCol}>
                        <FieldLabel>Registration Is Open?</FieldLabel>
                        <div style={{ display: 'inline-flex', justifyContent: 'flex-start' }}>
                            <input
                                type='radio'
                                name='courseClassRegistrationOpen'
                                value='yes'
                                checked={classObj.courseClassRegistrationOpen == 'yes'}
                                onChange={this.onChange}
                                style={{ marginRight: '10px', marginTop: '0px', alignSelf: 'center' }}
                            />
                            <span style={{ alignSelf: 'center' }}>yes</span>
                        </div>

                        <div style={{ display: 'inline-flex', justifyContent: 'flex-start', marginLeft: '15px' }}>
                            <input
                                type='radio'
                                name='courseClassRegistrationOpen'
                                value='no'
                                checked={classObj.courseClassRegistrationOpen == 'no'}
                                onChange={this.onChange}
                                style={{ marginRight: '10px', marginTop: '0px', alignSelf: 'center' }}
                            />
                            <span style={{ alignSelf: 'center' }}>no</span>
                        </div>
                    </Col>

                    <Col md={4} style={styles.formCol}>
                        <FieldLabel>Class Weight</FieldLabel>
                        <EditableValue
                            value={classObj.classWeight}
                            onFieldChange={this.onFieldChange}
                            noValueText='weight'
                        >
                            <input
                                name='classWeight'
                                id='classWeight'
                                type="text"
                                className='form-control'
                            />
                        </EditableValue>
                    </Col>
                </Row>

                <Row>
                    <Col md={4} style={styles.formCol}>
                        <FieldLabel>Key</FieldLabel>
                        <div style={{ display: 'inline-flex', justifyContent: 'flex-start' }}>
                            <input
                                name='classKey'
                                id='classKey'
                                type="radio"
                                checked={classObj.classKey == 'yes'}
                                value='yes'
                                onChange={this.onChange}
                                style={{ alignSelf: 'center' }}
                            />
                            <span style={{ alignSelf: 'center' }}>Yes</span>
                        </div>

                        <div style={{ display: 'inline-flex', justifyContent: 'flex-start', marginLeft: '15px' }}>
                            <input
                                name='classKey'
                                id='classKey'
                                type="radio"
                                checked={classObj.classKey == 'no'}
                                value='no'
                                onChange={this.onChange}
                                style={{ alignSelf: 'center' }}
                            />
                            <span style={{ alignSelf: 'center' }}>No</span>
                        </div>
                    </Col>

                    <Col md={4} style={styles.formCol}>
                        <FormField label='Key Code'>
                            <EditableValue
                                value={classObj.classKeyCode}
                                onFieldChange={this.onFieldChange}
                                >
                                <input
                                    name='classKeyCode' id='classKeyCode' type="text" className='form-control'
                                />
                            </EditableValue>
                        </FormField>
                    </Col>
                </Row>

                <Row>
                    <FormField width={12} label='Description' style={styles.formCol}>
                        <textarea
                            name="classDescription"
                            id="classDescription"
                            rows="2"
                            className="form-control"
                            value={classObj.classDescription}
                            onChange={this.onTextChange}
                        ></textarea>
                    </FormField>
                </Row>

                <Row>
                    <Col md={3}>
                        <div style={{ display: 'inline-flex', justifyContent: 'flex-start', marginBottom: 15 }}>
                            <FieldLabel style={{ alignSelf: 'center', margin: '0' }}>Use default receipt email</FieldLabel>
                            <input
                                style={{ marginLeft: '15px', alignSelf: 'center' }}
                                type='radio'
                                name='useDefaultReceipt'
                                value='true'
                                checked={useDefaultReceipt == 'true'}
                                onChange={() => {
                                    this.clearReceiptOverride()
                                    this.setState({ useDefaultReceipt: 'true' })
                                }}
                            />
                        </div>
                    </Col>
                    <Col md={3}>
                        <div style={{ display: 'inline-flex', justifyContent: 'flex-start', marginBottom: 15 }}>
                            <FieldLabel style={{ alignSelf: 'center', margin: '0' }}>Override</FieldLabel>
                            <input
                                style={{ marginLeft: '15px', alignSelf: 'center' }}
                                type='radio'
                                name='useDefaultReceipt'
                                checked={useDefaultReceipt == 'false'}
                                onChange={() => this.setState({ useDefaultReceipt: 'false' })}
                            />
                        </div>
                    </Col>
                </Row>

                <Panel collapsible expanded={useDefaultReceipt == 'false'} style={{ padding: '0', border: '0' }}>
                    <FormField width={12} style={{ paddingLeft: '0' }} label='Email subject'>
                        <EditableValue
                            enableExternalUpdates
                            value={classObj.receiptEmailSubject}
                            onFieldChange={this.onFieldChange}
                        >
                            <input
                                type='text'
                                name='receiptEmailSubject'
                                className='form-control'
                            />
                        </EditableValue>
                    </FormField>

                    <FormField width={12} style={{ paddingLeft: '0' }} label='Email body'>
                        <EditableValue
                            enableExternalUpdates
                            value={classObj.receiptEmailBody}
                            onFieldChange={this.onFieldChange}
                        >
                            <textarea
                                rows="4"
                                name='receiptEmailBody'
                                className='form-control'
                            />
                        </EditableValue>
                    </FormField>
                </Panel>

                <Row>
                    <FormField width={5} label='Group'>
                        <SourceSelect
                            url="/api/classes/groups/list"
                            className="form-control"
                            name="classGroupId"
                            id="classGroupId"
                            value={classObj.classGroupId}
                            onChange={this.onChange}>
                            <option value="0">None</option>
                        </SourceSelect>
                    </FormField>
                    <Col md={6}>
                        <Button
                            style={styles.sendEmailButton}
                            onClick={() => { this.setState({ showSendEmailWindow: true }) }}
                        >
                            Send Email to all students
                        </Button>
                    </Col>
                </Row>
            </div>
        )
    }

    renderControls() {
        const { classObj } = this.state;
        let buttonWrapperStyle = { alignSelf: 'center', marginLeft: '5px', marginRight: '5px', marginBottom: 15 }
        let buttonStyle = { width: '310px' }

        if (window.innerWidth < 768) {
            buttonWrapperStyle = { alignSelf: 'center', marginBottom: 15, width: '100%' }
            buttonStyle = { width: '100%' }
        } else if (window.innerWidth < 1025) {
            buttonWrapperStyle = { alignSelf: 'center', marginBottom: 15, marginLeft: 5, marginRight: 5, minWidth: 'calc(33% - 10px)' }
            buttonStyle = { width: '100%' }
        }

        const { classObj: {id} } = this.state

        const LinkBtn = ({ url, children }) => (
            <Link
                to={url}
                target='_blank'
                style={buttonWrapperStyle}
            >
                <Button style={buttonStyle} className='custom'>{children}</Button>
            </Link>
        )

        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <LinkBtn url={`/classes/${id}/print/weekend-registers`}>Weekend Registers</LinkBtn>
                    <LinkBtn url={`/classes/${id}/print/weekday-registers`}>Weekday Registers</LinkBtn>
                    <LinkBtn url={`/classes/${id}/print/adults`}>Adults Registers</LinkBtn>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap'  }}>
                    <LinkBtn url={`/classes/${id}/print/certificates`}>Print Certificates</LinkBtn>
                    <LinkBtn url={`/classes/${id}/print/certificates-names-only`}>Print Certificates (Just Names)</LinkBtn>
                    <LinkBtn url={`/classes/${id}/print/address-labels`}>Address Labels</LinkBtn>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap'  }}>
                    <LinkBtn url={`/classes/${id}/print/phone-numbers`}>Telephone</LinkBtn>
                    <LinkBtn url={`/classes/${id}/print/address-labels-plus`}>Address Labels + Teacher and Course</LinkBtn>
                    <LinkBtn url={`/classes/${id}/print/report`}>Report</LinkBtn>
                </div>
            </div>
        )
    }

    render() {
        const { isLoading, classObj, showSendEmailWindow } = this.state
        if (!this.isAllowed()) return false
        if (isLoading) {
            return (
                <div>
                    {this.renderHeader()}
                    <div><Spinner /></div>
                </div>
            )
        }

        return (
            <div>
                <CourseHeaderAdmin selectedTab='/classes' />

                <div className='content-block'>
                    {this.renderHeader()}
                    {this.renderDetail()}
                </div>

                <div className='content-block'>
                    <h2 className='block-heading'>Exams</h2>
                    <hr />
                    <ClassExams classObj={classObj} />

                    <Button
                        className='custom btn-success'
                        onClick={this.goToExamResults}
                        style={styles.addStudentExamResult}
                    >
                        Add student exam results
                    </Button>
                </div>

                <div className='content-block'>
                    <h2 className='block-heading'>Class Registration List</h2>
                    <hr />
                    <ClassRegistrationList classId={classObj.id} />

                    {this.renderControls()}
                </div>

                <div className='content-block'>
                    <h2 className='block-heading'>Form Code</h2>
                    <FormCode classObj={classObj} />
                </div>

                <div style={{ display: showSendEmailWindow ? 'block' : 'none' }}>
                    <SendEmailWindow
                        classId={classObj.id}
                        onClose={() => this.setState({ showSendEmailWindow: false })}
                    />
                </div>
            </div>
        )
    }
}
ClassesDetail.propTypes = {
    appTypeKey: PropTypes.string.isRequired,
    params:     PropTypes.object.isRequired
}

ClassesDetail.contextTypes = {
    router:   PropTypes.object.isRequired,
    branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    website:  PropTypes.object.isRequired
}

class ClassRegistrationList extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {selectedTab: 0, isLoading: true, students: null, totalCount: 0}
        this.promise = null
        this.page = 1
        this.rowsPerPage = 100
        this.requestFields = [
            'id',
            'studentId',
            'registerDate',
            'user.userFullname',
            'user.age',
            'studentStatus',
            'regPaymentStatus',
            'regStatus',
            'feedback',
            'score',
            'gradeStatus',
            'paypalTransactionId'
        ]
    }

    componentDidMount() {
        this.load()
    }

    render() {
        const { isLoading, selectedTab, students, totalCount } = this.state

        if (isLoading) return (<div><Spinner /></div>)

        return <StudentsTable rows={students} totalCount={totalCount} />
    }

    groupByRegStatus(data) {
        var resultData = { pending: [], active: [], waitingList: [] }
        data.forEach(item => {
            resultData[item.regStatus].push(item)
        })

        return resultData
    }

    sortStudents(students) {
        const get = O.getIfExists

        const sorted = students.sort((a, b) => {
            if (get(a, 'user.userFullname', '').toLowerCase() < get(b, 'user.userFullname', '').toLowerCase()) {
                return -1;
            }

            return 1;
        })

        return sorted
    }

    load() {
        const { classId: id } = this.props

        if (this.promise) this.promise.cancel()

        this.promise = PromiseHelper.ajax({
            type: 'get',
            url: '/api/classes/' + id + '/students',
            data: {
                page: this.page,
                rowsPerPage: this.rowsPerPage,
                fields: this.requestFields
            }
        })
        this.promise.then(
            data => {
                this.setState({ isLoading: false, students: this.sortStudents(data.rows), totalCount: data.info.totalCount })
            },
            xhr => console.log(xhr)
        )
    }

}
ClassRegistrationList.PropTypes = {
    classId: PropTypes.number.isRequired
}

class StudentsTable extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { rows: props.rows, checkedRows: [] }
        this.createRow = this.createRow.bind(this)
        this.createHead = this.createHead.bind(this)
    }

    render() {
        const { rows, totalCount } = this.props

        if (!rows || rows.length == 0)
            return <p>No students</p>

        return (
            <div>
                <h3>Total students : {totalCount}</h3>

                <Table
                    data={rows}
                    showingProps={['registerDate', 'user.userFullname']}
                    headers={['Registration Time', 'Student Name']}
                    createHead={this.createHead}
                    createRow={this.createRow}
                    checkableRows={true}
                    onCheckedRowsChange={checkedRows => this.setState({ checkedRows: checkedRows })}/>
            </div>
        )
    }

    createHead(headers) {
        var head = Table.createHeadBase(headers)
        head.push(<td key='controls'></td>)
        return head
    }

    createRow(rowObj, showingProps) {
        const lineStyle = { margin: '0 10px 0 10px', alignSelf: 'middle', width: '8px' }
        const get = O.getIfExists

        rowObj.registerDate = rowObj.registerDate.substr(0, 10)
        const age = get(rowObj, 'user.age', null) ? Dh.years(rowObj.user.age) : null
        const ageView = age ? ` (${age})` : ''

        var row = []
        row.push(<td><p>{rowObj.registerDate}</p></td>)
        row.push(<td><p>{get(rowObj, 'user.userFullname', '')} {ageView}</p></td>)

        row.push(
            <td key='controls'>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Link to={`/users/${rowObj.studentId}`}>Profile</Link>
                    <span style={lineStyle}> | </span>
                    <Link to={`/students/${rowObj.id}`}>Edit</Link>
                    <span style={lineStyle}> | </span>
                    <Link
                        to={`/students/${rowObj.id}/grades`}
                        style={{ display: 'inline-block', width: '90px' }}
                        target='_blank'
                        >
                        {`Grade : ${rowObj.score ? rowObj.score : 'none'}`}
                    </Link>
                    <span style={lineStyle}> | </span>
                    <Link
                        to={`/students/${rowObj.id}/print-report`}
                        target='_blank'
                    >Report</Link>
                    <span style={lineStyle}> | </span>
                    <Link to={`/students/${rowObj.id}/print-cert`} target='_blank'>Print Cert</Link>
                    {rowObj.transaction ?
                        (
                            <span>
                                <span style={lineStyle}> | </span>
                                <Link
                                    style={{ width: '110px' }}
                                    to={`/transactions/${rowObj.transaction.method}/${rowObj.transaction.id}`}
                                >
                                    Payment Detail
                                </Link>
                            </span>
                        ) : <span></span>
                    }
                </div>
            </td>
        )
        return row
    }
}
StudentsTable.PropTypes = {
    rows: PropTypes.arrayOf(PropTypes.object).isRequired
}

const FieldLabel = ({ children, style }) => <p style={style} className='detail-field-label'>{children}</p>

const FormCode = ({ classObj }) => {
    return (
        <div>
            <textarea
                className='form-control'
                readOnly
                style={{ fontSize: '10px', marginBottom: 15 }}
                value={
                    `<div class="">
    <h2>${classObj.course.dept.branchAssociated.branchName}</h2>
    <div class="">
        <div class="">
            <h3>${classObj.course.courseTitle}</h3>
        </div>
        <div class="">
                <h3>${classObj.classTime}</h3>
        </div>
        <div class="">
            <form method="post" id="register_online_form" class="register_form">
                <input type="hidden" name="course_class_id" value="${classObj.id}">
                <input type="hidden" name="student_status" value="unemployed">
                <input type="hidden" name="reg_payment_method" value="paypal">
                <input type="hidden" name="ajax" value="">
                <input type="submit" class="button" value="${classObj.course.courseTitle}">
            </form>
        </div>
    </div>
</div>`
                }
            ></textarea>
        </div>
    )
}