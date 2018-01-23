import React, { Component, PropTypes } from 'react'
import { ROLES } from './../../../config/constants.js'
import PromiseHelper from './../../../utils/PromiseHelper.js'
import CourseHeaderAdmin from './../../admin/CourseHeaderAdmin.jsx'
import { FormField } from './../../common/FormWidgets.jsx'
import FormGroup from './../../common/FormGroup.jsx'
import SourceSelect from './../../common/SourceSelect.jsx'
import ClassExams from './ClassExams.jsx'
import ClassPopulateExams from './ClassPopulateExams.jsx'
import { Button, Panel, Row, Col } from 'react-bootstrap'
import Notifier from '../../../utils/Notifier.js'
import Term from '../../../classes/Term.js'
import autosize from '../../../libs/autosize.js'
import Spinner from '../../common/Spinner.jsx'

export default class ClassesEdit extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            isLoading: false,
            classObj: {
                courseId: localStorage.getItem('targetCourseId'),
                teacherId: null,
                classroomId: null,
                courseClassTermId: null,
                classTime: '',
                courseClassCapacity: '0',
                courseClassRegistrationOpen: 'yes',
                classWeight: '0',
                classDescription: '',
                classKey: 'no',
                classKeyCode: '',
                classGroupId: null,
                classGender: 'both',
                submitted: '0'
            }
        }
        this.allowedRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN]
        this.headerTypes = {
            [ROLES.SUPER_ADMIN]: CourseHeaderAdmin,
            [ROLES.ADMIN]: CourseHeaderAdmin
        }
        this.promises = { save: null, load: null }
        this.requestFields = [
            'id',
            'courseId',
            'teacherId',
            'classroomId',
            'courseClassTermId',
            'classTime',
            'courseClassCapacity',
            'courseClassRegistrationOpen',
            'classWeight',
            'classDescription',
            'classKey',
            'classKeyCode',
            'classGroupId',
            'classGender',
            'submitted',
            'receiptEmailBody',
            'receiptEmailSubject',
            'receiptTemplate'
        ]
        this.handleFieldChange = this.handleFieldChange.bind(this)
        this.saveData = this.saveData.bind(this)

        localStorage.setItem('targetCourseId', null)
    }

    componentWillMount() {
        this.loadData()
    }

    componentWillUnmount() {
        for (let key in this.promises)
            if (this.promises[key]) this.promises[key].cancel()
    }

    render() {
        const { isLoading, classObj } = this.state

        if (!this.isAllowed()) return false

        if (isLoading) {
            return (
                <div>
                    {this.showHeader()}
                    <div><Spinner /></div>
                </div>
            )
        }

        return (
            <div>
                {this.showHeader()}

                <div className='content-block'>
                    <h2 className='block-heading'>New Class</h2>
                    <hr />

                    {this.renderClassEditForm()}
                </div>
            </div>
        )
    }

    isAllowed() {
        const { appTypeKey } = this.props
        return this.allowedRoles.indexOf(appTypeKey) !== -1
    }

    showHeader() {
        const { appTypeKey } = this.props
        if (appTypeKey in this.headerTypes)
            var ConcreteHeader = this.headerTypes[appTypeKey]

        return (
            <div>
                <ConcreteHeader selectedTab='/classes'/>
            </div>
        )
    }

    clearReceiptOverride() {
        let { classObj } = this.state
        classObj.receiptEmailBody = null
        classObj.receiptEmailSubject = null
        classObj.receiptTemplate = null
        this.setState({ classObj: classObj })
    }

    renderClassEditForm() {
        const { classObj, useDefaultReceipt } = this.state

        return (
            <div>
                <form id='classEditForm' onSubmit={e => this.submit(e)}>
                    <Row>
                        <Col md={4}>
                            <FormField label='Course' width={12}>
                                <SourceSelect
                                    name='courseId'
                                    id='courseId'
                                    url='/api/courses/list'
                                    className='form-control'
                                    value={classObj.courseId}
                                    onChange={this.handleFieldChange}>
                                    <option value="-1">-- Select Course --</option>
                                </SourceSelect>
                            </FormField>
                        </Col>

                        <Col md={4}>
                            <FormField label='Teacher' width={12}>
                                <SourceSelect
                                    name='teacherId'
                                    id='teacherId'
                                    url={'/api/users/' + ROLES.TEACHER + '/list'}
                                    className='form-control'
                                    value={classObj.teacherId}
                                    onChange={this.handleFieldChange}
                                    >
                                    <option value='-1'>-- Select Teacher --</option>
                                </SourceSelect>
                            </FormField>
                        </Col>

                        <Col md={4}>
                            <FormField label='Classroom' width={12}>
                                <SourceSelect
                                    name='classroomId'
                                    id='classroomId'
                                    url={'/api/classrooms/list'}
                                    className='form-control'
                                    value={classObj.classroomId}
                                    onChange={this.handleFieldChange}>
                                    <option value='-1'>-- Select Classroom --</option>
                                </SourceSelect>
                            </FormField>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={4}>
                            <FormField label='Term Name' width={12}>
                                <SourceSelect
                                    name='courseClassTermId'
                                    id='courseClassTermId'
                                    url='/api/terms/list'
                                    className='form-control'
                                    value={classObj.courseClassTermId}
                                    onChange={this.handleFieldChange}
                                    >
                                    <option value="-1">-- Select Term --</option>
                                </SourceSelect>
                            </FormField>
                        </Col>

                        <Col md={4}>
                            <FormField label='Class Time' width={12}>
                                <input
                                    type='text' name='classTime' id='classTime' className='form-control'
                                    value={classObj.classTime} onChange={this.handleFieldChange}/>
                            </FormField>
                        </Col>

                        <Col md={4}>
                            <p className='detail-field-label'>Gender</p>
                            <FormField width={12}>
                                <select
                                    className='form-control'
                                    name='classGender'
                                    id='genderSelect'
                                    value={classObj.classGender}
                                    onChange={this.handleFieldChange}
                                >
                                    <option value='male'>Male</option>
                                    <option value='female'>Female</option>
                                    <option value='both'>Both</option>
                                </select>
                            </FormField>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={4}>
                            <FormField width={12} label='Class Capacity'>
                                <input
                                    name='courseClassCapacity'
                                    id='courseClassCapacity'
                                    className='form-control'
                                    type="text"
                                    value={classObj.courseClassCapacity}
                                    onChange={this.handleFieldChange} />
                            </FormField>
                        </Col>

                        <Col md={4}>
                            <p>Registration Is Open?</p>
                            <FormField width={12}>
                                <div
                                    style={{
                                        display: 'inline-flex',
                                        justifyContent: 'center',
                                        marginRight: '15px'
                                    }}
                                >
                                    <input
                                        name='courseClassRegistrationOpen'
                                        id='courseClassRegistrationOpen'
                                        type="radio"
                                        checked={classObj.courseClassRegistrationOpen == 'yes'}
                                        value='yes'
                                        onChange={this.handleFieldChange}
                                        style={{ alignSelf: 'center' }}
                                    />
                                    <span style={{ alignSelf: 'center' }}>Yes</span>
                                </div>

                                <div
                                    style={{
                                        display: 'inline-flex',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <input
                                        name='courseClassRegistrationOpen'
                                        id='courseClassRegistrationOpen'
                                        type="radio"
                                        checked={classObj.courseClassRegistrationOpen == 'no'}
                                        value='no'
                                        onChange={this.handleFieldChange}
                                        style={{ alignSelf: 'center' }}
                                    />
                                    <span style={{ alignSelf: 'center' }}>No</span>
                                </div>
                            </FormField>
                        </Col>

                        <Col md={4}>
                            <FormField width={12} label='Class Weight'>
                                <input
                                    name='classWeight' id='classWeight' type="text" className='form-control'
                                    value={classObj.classWeight} onChange={this.handleFieldChange}/>
                            </FormField>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={4}>
                            <p className='detail-field-label'>Key</p>
                            <FormField width={12}>
                                <div
                                    style={{
                                        display: 'inline-flex',
                                        justifyContent: 'center',
                                        marginRight: '15px'
                                    }}
                                >
                                    <input
                                        name='classKey'
                                        id='classKey'
                                        type="radio"
                                        checked={classObj.classKey == 'yes'}
                                        value='yes'
                                        onChange={this.handleFieldChange}
                                        style={{ alignSelf: 'center' }}
                                    />
                                    <span style={{ alignSelf: 'center' }}>Yes</span>
                                </div>

                                <div
                                    style={{
                                        display: 'inline-flex',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <input
                                        name='classKey'
                                        id='classKey'
                                        type="radio"
                                        checked={classObj.classKey == 'no'}
                                        value='no'
                                        onChange={this.handleFieldChange}
                                        style={{ alignSelf: 'center' }}
                                    />
                                    <span style={{ alignSelf: 'center' }}>No</span>
                                </div>
                            </FormField>
                        </Col>

                        <Col md={4}>
                            <FormField width={12} label='Key Code'>
                                <input
                                    name='classKeyCode' id='classKeyCode' type="text" className='form-control'
                                    value={classObj.classKeyCode} onChange={this.handleFieldChange}/>
                            </FormField>
                        </Col>
                    </Row>

                    <FormField width={12} label='Description'>
                        <textarea
                            name="classDescription"
                            id="classDescription"
                            className="form-control"
                            value={classObj.classDescription}
                            onChange={this.handleFieldChange}>
                        </textarea>
                    </FormField>

                    <div
                        style={{
                            display: 'inline-flex',
                            justifyContent: 'flex-start',
                            marginRight: '15px'
                        }}
                    >
                        <p className='detail-field-label' style={{ alignSelf: 'center', margin: '0' }}>
                            Use default receipt email
                        </p>
                        <input
                            style={{ marginLeft: '15px', alignSelf: 'center'}}
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

                    <div
                        style={{
                            display: 'inline-flex',
                            justifyContent: 'flex-start',
                            marginRight: '15px'
                        }}
                    >
                        <p className='detail-field-label' style={{ alignSelf: 'center', margin: '0' }}>
                            Override
                        </p>
                        <input
                            style={{ marginLeft: '15px', alignSelf: 'center' }}
                            type='radio'
                            name='useDefaultReceipt'
                            checked={useDefaultReceipt == 'false'}
                            onChange={() => this.setState({ useDefaultReceipt: 'false' })}
                        />
                    </div>

                    <Panel collapsible expanded={useDefaultReceipt == 'false'} style={{ border: '0' }}>
                        <FormField width={12} label='Email subject'>
                            <input
                                type='text'
                                name='receiptEmailSubject'
                                value={classObj.receiptEmailSubject}
                                className='form-control'
                                onChange={this.handleFieldChange}
                            />
                        </FormField>

                        <FormField width={12} label='Email body'>
                            <textarea
                                name='receiptEmailBody'
                                value={classObj.receiptEmailBody}
                                className='form-control'
                                onChange={this.handleFieldChange}
                            />
                        </FormField>
                    </Panel>

                    <FormField width={5} label='Group'>
                        <SourceSelect
                            url="/api/classes/groups/list"
                            className="form-control"
                            name="classGroupId"
                            id="classGroupId"
                            value={classObj.classGroupId}
                            onChange={this.handleFieldChange}>
                            <option value="0">None</option>
                        </SourceSelect>
                    </FormField>

                    <FormGroup>
                        <Button className='custom btn-success' type='submit'>Save</Button>
                    </FormGroup>
                </form>
            </div>
        )
    }

    submit(e) {
        e.preventDefault()
        this.saveData()
    }

    handleFieldChange(e) {
        const { name, value } = e.target
        this.updateClassProp(name, value)
    }

    updateClassProp(prop, value) {
        console.log(prop)
        console.log(value)
        let classObj = Object.assign({}, this.state.classObj)
        classObj[prop] = value
        this.setState({ classObj: classObj })
    }

    loadData() {
        const { id } = this.props.params

        if (!id) {
            this.promises['activeTerm'] = Term.getActive(term => {
                this.updateClassProp('courseClassTermId', term.id)
            })
            return
        }

        this.setState({ isLoading: true })

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

    saveData() {
        const { id } = this.props.params
        const { classObj } = this.state

        var ajaxParams
        if (id)
            ajaxParams = {
                type: 'put',
                url: '/api/classes/' + id,
                data: classObj
            }
        else
            ajaxParams = {
                type: 'post',
                url: '/api/classes',
                data: classObj
            }

        this.promises.save = PromiseHelper.ajax(ajaxParams)
        this.promises.save.then(
            data => {
                console.log(data)
                Notifier.success('Saved successfully')
                this.context.router.push(`/courses/${data.courseId}/classes`)
            },
            xhr => {
                Notifier.error('Save failed')
            }
        )
    }
}
ClassesEdit.propTypes = {
    appTypeKey: PropTypes.string.isRequired
}

ClassesEdit.contextTypes = {
    router:     PropTypes.object.isRequired
}