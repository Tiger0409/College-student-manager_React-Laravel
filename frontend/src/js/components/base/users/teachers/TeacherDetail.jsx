import React, { PropTypes, Component } from 'react'
import { ROLES, ROLE_IDS } from './../../../../config/constants.js'
import { FormField, EditableHTML, EditableValue, RadioInputs } from './../../../common/FormWidgets.jsx'
import FormGroup from './../../../common/FormGroup.jsx'
import PromiseHelper from './../../../../utils/PromiseHelper.js'
import ObjHelper from './../../../../utils/ObjHelper.js'
import AjaxRadioInputs from './../../../common/AjaxRadioInputs.jsx'
import SourceSelect from './../../../common/SourceSelect.jsx'
import { Button, ListGroup, ListGroupItem, Row, Col } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import TeacherPayments from './TeacherPayments.jsx'
import AllowedBranches from '../../AllowedBranches.jsx'
import Notifier from '../../../../utils/Notifier.js'
import Switchable from '../../../common/Switchable.jsx'
import S from '../../../../utils/StringHelper.js'
import DataLoader from '../../../common/DataLoader.jsx'
import RoleFilter from '../../../common/RoleFilter.jsx'
import ConfirmDeleteWnd from '../../../common/ConfirmDeleteWnd.jsx'
import Spinner from '../../../common/Spinner.jsx'
import PostcodeSelect from '../../../common/PostcodeSelect.jsx'

class TeacherDetail extends Component {
    static allowedRoles() {
        return [ROLES.SUPER_ADMIN, ROLES.ADMIN]
    }

    constructor(props, context) {
        super(props, context)
        this.state = {
            teacher: {
                userName: '',
                userPassword: '',
                profile: {

                }
            },
            id: this.props.id,
            isLoading: false,
            teacherTitleOptopns: [],
            teacherStatusOptions: [],
            showConfirmDelete: false
        }
        this.promises = {
            load: null,
            save: null,
            loadTeacherTitles: null,
            loadTeacherStatus: null
        }
        this.requestFields = [
            'id',
            'age',
            'userEmailAddress',
            'userStatus',
            'userUniqueId',
            'allowedBranches',
            'profile.profileTeacherTitle',
            'profile.teacherNotes',
            'profile.teacherHourlyRate',
            'profile.teacherStatusCode',
            'profile.profileForname',
            'profile.profileSurname',
            'profile.profilePostcode',
            'profile.profileAddress',
            'profile.profileAddress2',
            'profile.city',
            'profile.profileTelephone',
            'profile.profileMobile',
            'profile.profileGender',
            'profile.employmentField',
            'teacherPayments',
            'teacherCourseClasses',
        ]
        this.submit = this.submit.bind(this)
        this.onFieldChange = this.onFieldChange.bind(this)
        this.changeField = this.changeField.bind(this)
        this.save = this.save.bind(this)
        this.deleteUser = this.deleteUser.bind(this)
        this.back = this.back.bind(this)
    }

    componentWillMount() {
        this.load()
    }

    componentWillUnmount() {
        for (let key in this.promises) {
            if (this.promises[key]) {
                this.promises[key].cancel()
            }
        }
    }

    submit(e) {
        e.preventDefault()
    }

    load() {
        this.loadOptions()

        const { id } = this.props

        if (!id) return

        this.setState({isLoading: true})

        if (this.promises.load)
            this.promises.load.cancel()

        this.promises.load = PromiseHelper.ajax({
            type: 'get',
            url: '/api/users/' + id,
            data: { fields: this.requestFields }
        })
        this.promises.load.then(
            data => {
                this.setState({ isLoading: false, teacher: data })
            },
            xhr => console.log(xhr)
        )
    }

    loadOptions() {
        var { promises } = this

        const loadOptionPromise = (promiseName, url, propName) => {
            promises[promiseName] = PromiseHelper.ajax({
                type: 'get',
                url: url
            })

            promises[promiseName].then(
                data => this.setState({ [propName]: data }),
                xhr => console.log(xhr)
            )
        }

        loadOptionPromise(
            'loadTeacherTitles',
            '/api/profiles/get-profile-teacher-title-enum',
            'teacherTitleOptions'
        )

        loadOptionPromise(
            'loadTeacherStatus',
            '/api/lookup/get-teacher-status',
            'teacherStatusOptions'
        )
    }

    beforeSave() {
        var { id, teacher } = this.state

        if (!id) {
            teacher.userMainRole = ROLE_IDS[ROLES.TEACHER]
        }

        const forName = ObjHelper.accessObjByPath(teacher, 'profile.profileForname')
        const surName = ObjHelper.accessObjByPath(teacher, 'profile.profileSurname')
        teacher.userFullname = [forName, surName].join(' ').trim()
        teacher.profile.age = teacher.age
        teacher.profile.allowedBranches = teacher.allowedBranches
        this.setState({ teacher: teacher })
    }

    save() {
        this.beforeSave()

        var { id, teacher } = this.state

        var ajaxParams = {}
        if (id) {
            ajaxParams = {
                type: 'put',
                url: '/api/users/' + id,
                data: teacher
            }
        } else {
            ajaxParams = {
                type: 'post',
                url: '/api/users',
                data: teacher
            }
        }

        this.promises.save = PromiseHelper.ajax(ajaxParams)
        this.promises.save.then(
            data => {
                Notifier.success('Saved successfully')
                this.back()
            },
            xhr => {
                Notifier.error('Save failed')
                console.log(xhr)
            }
        )
    }

    deleteUser(reason) {
        const { id } = this.state
        if (!id) return

        $.ajax({
            type: 'delete',
            url: '/api/users/' + id,
            data: { reason: reason },
            success: response => {
                Notifier.success('Deleted successfully')
                console.log(response)
            },
            error: error => {
                Notifier.error('Deletion failed')
                console.log(error)
            }
        })

        this.back()
    }

    back() {
        this.context.router.push('/users/role/teachers')
    }

    onFieldChange(e) {
        this.changeField(e.target.name, e.target.value)
    }

    changeField(name, value) {
        var { teacher } = this.state
        ObjHelper.accessObjByPath(teacher, name, () => value)

        this.setState({ teacher: teacher })
    }

    renderFormButtons() {
        const { id } = this.state
        var deleteBtn = false
        if (id) {
            deleteBtn = (
                <Button
                    className='custom btn-danger'
                    onClick={() => this.setState({ showConfirmDelete: true })}
                >
                    Delete user
                </Button>
            )
        }

        return (
            <div>
                <FormGroup>
                    <Button
                        style={{ marginRight: '15px' }}
                        className='custom btn-success'
                        onClick={this.save}
                    >
                        Save
                    </Button>

                    <Button style={{ marginRight: '15px' }} className='custom' onClick={this.back}>Cancel</Button>

                    {deleteBtn}
                </FormGroup>
            </div>
        )
    }

    render() {
        const { isLoading, teacher, teacherTitleOptions, teacherStatusOptions, showConfirmDelete } = this.state

        if (isLoading) return <Spinner />

        const get = ObjHelper.accessObjByPath

        return (
            <div>

                <div id="notifications"></div>

                <form onSubmit={this.submit}>
                    <div className='content-block'>
                        <h2 className='block-heading'>Teacher profile</h2>
                        <hr />
                        <Row>
                            <Col md={6}>
                                <Row>
                                    <FormField width={12} label='Title'>
                                        <EditableRadioInput
                                            activeProps={{
                                                options: teacherTitleOptions,
                                                name: 'profile.profileTeacherTitle',
                                                value: get(teacher, 'profile.profileTeacherTitle'),
                                                onChange: this.onFieldChange
                                            }}
                                            passiveProps={{ value: get(teacher, 'profile.profileTeacherTitle') }}
                                        />
                                    </FormField>

                                    <FormField width={12} label='Forname'>
                                        <EditableInput
                                            passiveProps={{
                                                value: get(teacher, 'profile.profileForname')
                                            }}
                                            activeProps={{
                                                type: 'text',
                                                name: 'profile.profileForname',
                                                className: 'form-control',
                                                value: get(teacher, 'profile.profileForname'),
                                                onChange: this.onFieldChange
                                            }}
                                        />
                                    </FormField>

                                    <FormField width={12} label='Surname'>
                                        <EditableInput
                                            passiveProps={{
                                        value: get(teacher, 'profile.profileSurname')
                                    }}
                                            activeProps={{
                                        type: 'text',
                                        name: 'profile.profileSurname',
                                        className: 'form-control',
                                        value: get(teacher, 'profile.profileSurname'),
                                        onChange: this.onFieldChange
                                    }}
                                            />
                                    </FormField>

                                    <FormField width={12} label='Age'>
                                        <EditableInput
                                            passiveProps={{
                                        value: teacher.age
                                    }}
                                            activeProps={{
                                        type: 'date',
                                        name: 'age',
                                        className: 'form-control',
                                        value: teacher.age,
                                        onChange: this.onFieldChange
                                    }}
                                            />
                                    </FormField>

                                    <FormField width={12} label='Email Address'>
                                        <EditableInput
                                            passiveProps={{
                                        value: teacher.userEmailAddress
                                    }}
                                            activeProps={{
                                        type: 'text',
                                        name: 'userEmailAddress',
                                        className: 'form-control',
                                        value: teacher.userEmailAddress,
                                        onChange: this.onFieldChange
                                    }}
                                            />
                                    </FormField>
                                </Row>
                                <Row style={{ marginBottom: '15px' }}>
                                    <Col md={12}>
                                        <p className="detail-field-label">Postcode</p>

                                        <PostcodeSelect
                                            value={teacher.profile.profilePostcode}
                                            onSelect={item => {
                                                const get = value => value ? value : ''
                                                this.changeField('profile.profileAddress', get(item.line1))
                                                this.changeField('profile.profileAddress2', get(item.line2))
                                                this.changeField('profile.profilePostcode', get(item.postcode))
                                                this.changeField('profile.city', get(item.town))
                                            }}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <FormField width={12} label='Address'>
                                        <EditableInput
                                            passiveProps={{
                                        value: get(teacher, 'profile.profileAddress')
                                    }}
                                            activeProps={{
                                        type: 'text',
                                        name: 'profile.profileAddress',
                                        className: 'form-control',
                                        value: get(teacher, 'profile.profileAddress'),
                                        onChange: this.onFieldChange
                                    }}
                                            />
                                    </FormField>

                                    <FormField width={12} label='Address 2'>
                                        <EditableInput
                                            passiveProps={{
                                        value: get(teacher, 'profile.profileAddress2')
                                    }}
                                            activeProps={{
                                        type: 'text',
                                        name: 'profile.profileAddress2',
                                        className: 'form-control',
                                        value: get(teacher, 'profile.profileAddress2'),
                                        onChange: this.onFieldChange
                                    }}
                                            />
                                    </FormField>
                                </Row>
                            </Col>

                            <Col md={6}>
                                <Row>
                                    <FormField width={12} label='City'>
                                        <EditableInput
                                            passiveProps={{
                                        value: get(teacher, 'profile.city')
                                    }}
                                            activeProps={{
                                        type: 'text',
                                        name: 'profile.city',
                                        className: 'form-control',
                                        value: get(teacher, 'profile.city'),
                                        onChange: this.onFieldChange
                                    }}
                                            />
                                    </FormField>

                                    <FormField width={12} label='Telephone'>
                                        <EditableInput
                                            passiveProps={{
                                        value: get(teacher, 'profile.profileTelephone')
                                    }}
                                            activeProps={{
                                        type: 'text',
                                        name: 'profile.profileTelephone',
                                        className: 'form-control',
                                        value: get(teacher, 'profile.profileTelephone'),
                                        onChange: this.onFieldChange
                                    }}
                                            />
                                    </FormField>

                                    <FormField width={12} label='Mobile'>
                                        <EditableInput
                                            passiveProps={{
                                        value: get(teacher, 'profile.profileMobile')
                                    }}
                                            activeProps={{
                                        type: 'text',
                                        name: 'profile.profileMobile',
                                        className: 'form-control',
                                        value: get(teacher, 'profile.profileMobile'),
                                        onChange: this.onFieldChange
                                    }}
                                            />
                                    </FormField>

                                    <FormField width={12} label='Unique ID'>
                                        <EditableInput
                                            passiveProps={{
                                        value: teacher.userUniqueId
                                    }}
                                            activeProps={{
                                        type: 'text',
                                        name: 'userUniqueId',
                                        className: 'form-control',
                                        value: teacher.userUniqueId,
                                        onChange: this.onFieldChange
                                    }}
                                            />
                                    </FormField>

                                    <FormField width={12} label='Male/Female'>
                                        <EditableValue
                                            value={get(teacher, 'profile.profileGender')}
                                            onFieldChange={this.changeField}
                                        >
                                            <select
                                                name='profile.profileGender'
                                                className='form-control'
                                            >
                                                <option value='none'>Select Gender</option>
                                                <option value='male'>Male</option>
                                                <option value='female'>Female</option>
                                            </select>
                                        </EditableValue>
                                    </FormField>

                                    <FormField width={12} label='CRB'>
                                        <EditableInput
                                            passiveProps={{
                                                value: get(teacher, 'profile.teacherCrb')
                                            }}
                                            activeProps={{
                                                style: {display: 'block'},
                                                type: 'checkbox',
                                                name: 'profile.teacherCrb',
                                                value: get(teacher, 'profile.teacherCrb'),
                                                onChange: this.onFieldChange
                                            }}
                                        />
                                    </FormField>

                                    <FormField width={12} label='Teacher Status'>
                                        <EditableValue
                                            value={get(teacher, 'profile.teacherStatusCode')}
                                            onFieldChange={this.changeField}
                                            >
                                            <select
                                                name='profile.teacherStatusCode'
                                                className='form-control'
                                                >
                                                <option value='0'>None</option>
                                            </select>
                                        </EditableValue>
                                    </FormField>

                                    <FormField width={12} label='Teacher Hourly Rate'>
                                        <EditableValue
                                            value={get(teacher, 'profile.teacherHourlyRate')}
                                            onFieldChange={this.changeField}
                                            >
                                            <input
                                                type='text'
                                                name='profile.teacherHourlyRate'
                                                className='form-control'
                                                />
                                        </EditableValue>
                                    </FormField>
                                </Row>
                            </Col>
                        </Row>

                        <Label>Teacher Notes</Label>
                        <EditableHTML
                            value={get(teacher, 'profile.teacherNotes')}
                            name='profile.teacherNotes'
                            onChange={this.onFieldChange}
                            onlyEdit
                        />

                        <h2 className='block-heading'>Payments</h2>
                        <hr />
                        <TeacherPayments
                            payments={teacher.teacherPayments}
                            onChange={payments => this.changeField('teacherPayments', payments)}
                        />

                        <h2 className='block-heading'>Assigned Classes</h2>
                        <hr />
                        <Row>
                            <FormField width={5}>
                                <AssignedClasses classes={teacher.teacherCourseClasses} />
                            </FormField>
                        </Row>

                        {this.renderFormButtons()}

                    </div>
                </form>

                <ConfirmDeleteWnd
                    show={showConfirmDelete}
                    onConfirm={this.deleteUser}
                    onClose={() => this.setState({ showConfirmDelete: false })}
                />
            </div>
        )
    }
}
TeacherDetail.PropTypes = {
    id: PropTypes.number
}
TeacherDetail.contextTypes = {
    router: React.PropTypes.object.isRequired
}

const Input = ({ type, value, name, checked, onChange, className }) => (
    <input type={type} value={value} name={name} checked={checked} onChange={onChange} className={className} />
)
const TextView = ({ value }) => {
    if (value && value.length > 0) {
        value = S.ucFirst(value)
    } else {
        value = '----------------------------'
    }

    return <p className='detail-field-value highlighted'>{value}</p>
}
const EditableRadioInput = Switchable(RadioInputs, TextView)
const EditableInput = Switchable(Input, TextView)

var AssignedClasses = class extends Component {
    constructor(props, context) {
        super(props, context)
        this.termOptions = props.data

        let selectedTerm = null
        for (let i = 0; i < this.termOptions.length; i++) {
            if (this.termOptions[i].isActive == '1') {
                selectedTerm = this.termOptions[i].value
                break
            }
        }

        this.state = { selectedTerm: selectedTerm }
        this.selectClass = this.selectClass.bind(this)
    }

    selectClass(id) {
        this.context.router.push(`/classes/${id}`)
    }

    renderClasses() {
        const { classes } = this.props
        const { selectedTerm } = this.state

        var listItems = []
        classes && classes.forEach((classItem, i) => {
            if (classItem.termId == selectedTerm) {
                listItems.push(
                    <ListGroupItem key={i} onClick={() => this.selectClass(classItem.id)}>
                        {`${classItem.classTime} (${classItem.courseTitle})`}
                    </ListGroupItem>
                )
            }
        })

        return (
            <ListGroup>
                {listItems}
            </ListGroup>
        )
    }

    render() {
        const { selectedTerm } = this.state

        return (
            <div>
                <select
                    className='form-control'
                    value={selectedTerm}
                    onChange={e => this.setState({ selectedTerm: e.target.value })}
                    >
                    {
                        this.termOptions.map(
                                term => <option key={term.value} value={term.value}>{term.label}</option>
                        )
                    }
                </select>

                {this.renderClasses()}
            </div>
        )
    }
}

AssignedClasses.contextTypes = {
    router: PropTypes.object.isRequired
}

AssignedClasses = DataLoader(
    AssignedClasses,
    {
        load: { type: 'get', url: '/api/terms/list' }
    }
)

export default RoleFilter(TeacherDetail, TeacherDetail.allowedRoles())

const Label = ({ children }) => (<p className='detail-field-label'>{children}</p>)