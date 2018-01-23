import React, { Component, PropTypes } from 'react'
import { ROLES } from './../../config/constants.js'
import PromiseHelper from './../../utils/PromiseHelper.js'
import CourseHeaderAdmin from './../admin/CourseHeaderAdmin.jsx'
import SourceSelect from './../common/SourceSelect.jsx'
import FormGroup from './../common/FormGroup.jsx'
import { Button, Row, Col } from 'react-bootstrap'
import Notifier from '../../utils/Notifier.js'
import { FormField } from '../common/FormWidgets.jsx'
import Convert from '../../utils/Convert.js'
import autosize from '../../libs/autosize.js'
import ConfirmDialog from '../common/ConfirmDialog.jsx'
import Spinner from '../common/Spinner.jsx'

export default class CoursesEdit extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            isLoading: true,
            course: {
                deptId: props.params.deptId,
                courseTitle: '',
                courseCode: '',
                weight: '',
                courseSubtitle: '',
                feeForEmployed: 0,
                feeForUnemployed: 0,
                courseDescription: '',
                courseStructure: '',
                courseGroupId: 0,
                isFullTime: '0'
            },
            formData: null,
            showConfirm: false
        }
        this.promises = {
            load: null,
            save: null
        }
        this.headerTypes = {
            [ROLES.SUPER_ADMIN]: CourseHeaderAdmin,
            [ROLES.ADMIN]: CourseHeaderAdmin,
            [ROLES.REGISTRAR]: CourseHeaderAdmin
        }
        this.requestFields = [
            'deptId',
            'courseTitle',
            'courseCode',
            'weight',
            'courseSubtitle',
            'feeForEmployed',
            'feeForUnemployed',
            'courseDescription',
            'courseStructure',
            'courseGroupId',
            'isFullTime'
        ]
        this.submit = this.submit.bind(this)
        this.handleFieldChange = this.handleFieldChange.bind(this)
        this.handleFileFieldChange = this.handleFileFieldChange.bind(this)
        this.setCourse = this.setCourse.bind(this)
    }

    jqueryInit() {
        if (this.jqueryInitialized) return

        $(() => {
            console.log('test : ', $('textarea'))
            autosize($('textarea'))
            this.jqueryInitialized = true
        })
    }

    componentDidMount() {
        if (this.props.params.id)
            this.loadData()
        else {
            this.setState({ isLoading: false, formData: new FormData() })
        }
    }

    componentWillUnmount() {
        for (let key in this.promises) {
            var promise = this.promises[key]
            if (promise) promise.cancel()
        }
    }

    render() {
        if (!this.isAllowed()) return false

        if (this.state.isLoading)  {
            return (
                <div>
                    {this.showHeader()}
                    <div><Spinner /></div>
                </div>
            )
        }

        const { course } = this.state
        if (!course && this.props.params.id) return (<div>{this.showHeader()}<p>No data.</p></div>)

        const { branchId, website } = this.context
        const Label = ({ children }) => (<p className='detail-field-label'>{children}</p>)

        return (
            <div>
                {this.showHeader()}

                <div id="notifications"></div>

                <div className='content-block'>
                    <h2 className='block-heading'>Course</h2>
                    <hr />

                    <form method='put' id='courseEditForm' onSubmit={this.submit}>
                        <Row>
                            <Col md={6} style={{ marginBottom: '15px' }}>
                                <Label>Dept</Label>
                                <SourceSelect
                                    url="/api/depts/list"
                                    className="form-control"
                                    name="deptId"
                                    id="deptId"
                                    value={course.deptId}
                                    onChange={this.handleFieldChange}
                                    optionPredicate={option => {
                                        return !branchId || option.branchId == branchId || option.value == course.deptId
                                    }}
                                >
                                    <option value="0">None</option>
                                </SourceSelect>
                            </Col>

                            <Col md={6} style={{ marginBottom: '15px' }}>
                                <Label>Group</Label>
                                <SourceSelect
                                    url="/api/courses/groups/list"
                                    className="form-control"
                                    name="courseGroupId"
                                    id="courseGroupId"
                                    value={course.courseGroupId}
                                    onChange={this.handleFieldChange}
                                >
                                    <option value="0">None</option>
                                </SourceSelect>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6} style={{ marginBottom: '15px' }}>
                                <Label>Title</Label>
                                <input
                                    id="courseTitle"
                                    name="courseTitle"
                                    type="text"
                                    className="form-control"
                                    value={course.courseTitle}
                                    onChange={this.handleFieldChange}
                                />
                            </Col>

                            <Col md={6} style={{ marginBottom: '15px' }}>
                                <Label>Code</Label>
                                <input
                                    id="courseCode"
                                    name="courseCode"
                                    type="text"
                                    className="form-control"
                                    value={course.courseCode}
                                    onChange={this.handleFieldChange}
                                />
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6} style={{ marginBottom: '15px' }}>
                                <Label>Weight</Label>
                                <input
                                    id="weight"
                                    name="weight"
                                    type="text"
                                    className="form-control"
                                    value={course.weight}
                                    onChange={this.handleFieldChange}
                                />
                            </Col>

                            <Col md={6} style={{ marginBottom: '15px' }}>
                                <Label>Subtitle</Label>
                                <input
                                    id="courseSubtitle"
                                    name="courseSubtitle"
                                    type="text"
                                    className="form-control"
                                    value={course.courseSubtitle}
                                    onChange={this.handleFieldChange}
                                />

                                <input
                                    style={{ marginTop: '10px' }}
                                    type='file'
                                    name='courseSubtitlePdf'
                                    onChange={this.handleFileFieldChange}
                                    accept='application/pdf'
                                />
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6} style={{ marginBottom: '15px' }}>
                                <Label>{website.paymentField1} fee</Label>
                                <input
                                    type='text'
                                    name='feeForEmployed'
                                    className='form-control'
                                    value={course.feeForEmployed}
                                    onChange={this.handleFieldChange}
                                />
                            </Col>

                            <Col md={6} style={{ marginBottom: '15px' }}>
                                <Label>F{website.paymentField2} fee</Label>
                                <input
                                    type='text'
                                    name='feeForUnemployed'
                                    className='form-control'
                                    value={course.feeForUnemployed}
                                    onChange={this.handleFieldChange}
                                />
                            </Col>
                        </Row>

                        <Row>
                            <FormField width={12} label='Description'>
                                <textarea
                                    name="courseDescription"
                                    id="courseDescription"
                                    rows="2"
                                    className="form-control"
                                    value={course.courseDescription}
                                    onChange={this.handleFieldChange}
                                ></textarea>
                            </FormField>

                            <FormField width={12} label='Structure'>
                                <textarea
                                    name="courseStructure"
                                    id="courseStructure"
                                    rows="2"
                                    className="form-control"
                                    value={course.courseStructure}
                                    onChange={this.handleFieldChange}
                                ></textarea>
                            </FormField>
                        </Row>
                        <Row>
                            <FormField width={6} label='Is Full Time'>
                                <input
                                    style={{ display: 'block' }}
                                    type='checkbox'
                                    name='isFullTime'
                                    checked={course.isFullTime == '1'}
                                    onChange={this.handleFieldChange}
                                />
                            </FormField>
                            <Col md={6} style={{ marginBottom: '15px' }}>
                                <Button
                                    className='custom btn-success'
                                    onClick={() => this.setState({ showConfirm: true })}
                                >
                                    Save
                                </Button>
                            </Col>
                        </Row>
                    </form>
                </div>

                <ConfirmDialog
                    headerText='Update Course'
                    confirmText='Are you sure?'
                    onYes={() => { this.submit(); this.setState({ showConfirm: false }) }}
                    onNo={() => this.setState({ showConfirm: false })}
                    show={this.state.showConfirm}
                />
            </div>
        )
    }

    submit(e) {
        if (e) e.preventDefault()
        this.saveData()
    }

    setCourse(name, value, fileName) {
        let { course, formData } = this.state
        course[name] = value

        if (fileName) {
            formData.set(name, value, fileName)
        } else {
            formData.set(name, value)
        }

        this.setState({ course: course, formData: formData })
    }

    handleFieldChange(e) {
        const { name, value, type, checked } = e.target

        if (type == 'checkbox') {
            this.setCourse(name, checked ? '1' : '0')
            return
        }

        this.setCourse(name, value)
    }

    handleFileFieldChange(e) {
        const { files, name } = e.target

        let file = files[0]
        this.setCourse(name, file, file.name)
        this.setCourse('courseSubtitle', `${document.location.origin}/pdf/${file.name}`)
    }

    isAllowed() {
        var appKey = this.props.appTypeKey
        if (appKey)
            return CoursesEdit.allowedRoles().indexOf(appKey) !== -1
        return false
    }

    showHeader() {
        var appTypeKey = this.props.appTypeKey
        if (appTypeKey in this.headerTypes)
            var ConcreteHeader = this.headerTypes[appTypeKey]

        return (
            <div>
                <ConcreteHeader selectedTab='/courses'/>
            </div>
        )
    }

    loadData() {
        this.setState({ isLoading: true })

        var requestParams = { fields: this.requestFields }
        this.promises.load = PromiseHelper.makeCancelableAjax(
            $.ajax({
                type: 'get',
                url: '/api/courses/' + this.props.params.id,
                data: requestParams
            })
        )
        this.promises.load.promise.then(
            data => {
                let formData = new FormData()

                for (let prop in data) {
                    formData.append(prop, data[prop])
                }

                this.setState({ isLoading: false, course: data, formData: formData })

                this.jqueryInit()
            },
            xhr => { this.setState({ isLoading: false }); console.log(xhr) }
        )
    }

    saveData() {
        const { formData } = this.state
        const { id } = this.props.params

        var ajaxParams = {
            type: 'post',
            url: '/api/courses',
            cache: false,
            processData: false,
            contentType: false,
            mimeType: 'multipart/form-data',
            data: formData
        }

        if (id) {
            ajaxParams.url += `/${id}`
        }

        this.promises.save = PromiseHelper.ajax(ajaxParams)
        this.promises.save.then(
            () => {
                this.context.router.push('/courses')
                Notifier.success('Saved successfully')
            },
            xhr => {
                Notifier.error('Save failed')
                console.log(xhr)
            }
        )
    }


    static allowedRoles() {
        return [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.REGISTRAR]
    }
}

CoursesEdit.contextTypes = {
    branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    router: PropTypes.object.isRequired,
    website: PropTypes.object.isRequired
}