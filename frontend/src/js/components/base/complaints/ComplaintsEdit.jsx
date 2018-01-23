import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { Row, Col, Button } from 'react-bootstrap'
import { DatePicker } from '../../common/FormWidgets.jsx'
import Spinner from '../../common/Spinner.jsx'
import UserList from '../../common/UserList.jsx'
import Ph from '../../../utils/PromiseHelper.js'
import Sh from '../../../utils/StringHelper.js'
import Notifier from '../../../utils/Notifier.js'
import SourceSelect from '../../common/SourceSelect'
import autosize from '../../../libs/autosize'
import ConfirmDeleteWnd from '../../common/ConfirmDeleteWnd'
import RichEditor from '../../common/RichEditor'

const Label = ({ children }) => <p className='detail-field-label'>{children}</p>

class MyEditor extends Component {
    constructor(props) {
        super(props)
        this.state = {editorState: EditorState.createEmpty()}
        this.onChange = (editorState) => this.setState({editorState})
    }
    render() {
        const {editorState} = this.state;
        return <Editor editorState={editorState} onChange={this.onChange} />
    }
}

let styles = {
    buttonAfter: { marginLeft: 15 },
    button: { marginBottom: 10 }
}

if (window.innerWidth < 768) {
    styles = {
        buttonAfter: { width: '100%' },
        button: { width: '100%' }
    }
}

export default class ComplaintsEdit extends Component {
    constructor(props, context) {
        super(props, context)

        this.clearListeners = []

        this.state = {
            complaintTypes: [],
            isLoading: false,
            showConfirmDelete: false,
            initComplaint : {
                createdAt: new Date().toJSON().slice(0, 10),
                types: [],
                text: '',
                handlerFullname: '',
                actionTaken: '',
                actionDeadline: '',
                completionDate: '',
                users: [],
                branchId: 'null',
                termId: 'null',
                name: '',
                recordedBy: '',
                priority: 'not urgent',
                suggestions: '',
                otherComments: '',
                dateOfAllegedIncident: ''
            }
        }

        this.state.complaint = this.state.initComplaint

        this.updateComplaint = this.updateComplaint.bind(this)
        this.onChange = this.onChange.bind(this)
        this.onMultiCheckboxChange = this.onMultiCheckboxChange.bind(this)
        this.submit = this.submit.bind(this)
        this.delete = this.delete.bind(this)
        this.updateDatePickers = this.updateDatePickers.bind(this)
        this.addClearListener = this.addClearListener.bind(this)
    }

    updateComplaint(name, value) {
        let { complaint } = this.state
        complaint[name] = value
        this.setState({ complaint: complaint })
    }

    addClearListener(listener) {
        this.clearListeners.push(listener)
    }

    onChange({ target }) {
        this.updateComplaint(target.name, target.value)
    }

    onMultiCheckboxChange({ target }) {
        let selected = this.state.complaint[target.name]

        const value = parseInt(target.value)
        const index = selected.indexOf(value)

        if (index === -1) {
            selected.push(value)
        } else {
            selected.splice(index, 1)
        }
        this.updateComplaint(target.name, selected)
    }

    loadComplaintTypes() {
        if (this.complaintTypesLoader) {
            return
        }

        this.complaintTypesLoader = Ph.ajax({
            type: 'get',
            url: '/api/complaints/types'
        })

        this.complaintTypesLoader.then(
            types => {
                this.setState({ complaintTypes: types })
                this.complaintTypesLoader = null
            },
            xhr => {
                Notifier.error(xhr.responseText)
                console.error(xhr)
                this.complaintTypesLoader = null
                this.setState({ isLoading: false })
            }
        )

    }

    validate(complaint) {
        const required = [
            { name: 'createdAt', label: 'Date of complaint' },
            { name: 'text', label: 'Complaint' },
            { name: 'name', label: 'Name of complainant' },
            { name: 'recordedBy', label: 'Complaint recorded by' },
            { name: 'handlerFullname', label: 'Person dealing with complaint' }
        ]

        return required.filter(field => !complaint[field.name]).map(field => `${field.label} must not be empty`)
    }

    submit() {
        if (this.submitPromise) {
            return
        }

        const errors = this.validate(this.state.complaint)
        if (errors.length != 0) {
            errors.forEach(error => Notifier.error(error))
            return
        }

        const { id } = this.props.params
        let { complaint } = this.state

        if (complaint.users && complaint.users.length == 0) {
            complaint.users = ['']
        }

        if (id) {
            this.submitPromise = Ph.ajax({
                type: 'put',
                url: `/api/complaints/${id}`,
                data: complaint
            })
        } else {
            this.submitPromise = Ph.ajax({
                type: 'post',
                url: '/api/complaints',
                data: complaint
            })
        }

        this.submitPromise.then(
            () => {
                Notifier.success(`Complaint ${id ? 'updated' : 'added'}`)
                this.submitPromise = null
                this.context.router.push('/complaints/list')
            },
            xhr => {
                Notifier.error(`Failed to ${id ? 'update' : 'add'} complaint`)
                console.error(xhr.responseText)
                this.submitPromise = null
            }
        )
    }

    delete(confirmed, reason) {
        if (!confirmed) {
            this.setState({ showConfirmDelete: true })
            return
        }

        $.ajax({
            type: 'delete',
            url: '/api/complaints',
            data: { ids: [this.props.params.id], reason: reason },
            success: () => {
                Notifier.success('Deleted successfully')
                this.context.router.push('/complaints/list')
            },
            error: xhr => {
                Notifier.error('Failed to delete')
                console.error(xhr.responseText)
            }
        })
    }

    updateDatePickers() {
        DatePicker.init((name, value) => {
            const parts = value.split('-')
            const formatedValue = ([parts[2], parts[1], parts[0]]).join('-')
            this.updateComplaint(name, formatedValue)
        })
    }

    loadActiveTermId () {
        // load active term data
        return Ph.ajax({
            type: 'get',
            url: '/api/terms/active'
        }).promise.then((data) => {
            let { initComplaint } = this.state
            initComplaint.termId = data.id
            this.setState({ initComplaint: initComplaint })
            return data
        })
    }

    loadComplaint(props) {
        const { id } = (props ? props : this.props).params
        if (!id) return

        this.setState({ isLoading: true })

        $.ajax({
            type: 'get',
            url: `/api/complaints/${id}`,
            success: data =>  {
                data.types = data.types ? data.types.map(type => type.id) : []
                this.setState({ complaint: data, isLoading: false })
            },
            error: xhr => {
                console.error(xhr.responseText)
                Notifier.error('Failed to load complaint')
                this.setState({ isLoading: false })
            }
        })
    }

    componentWillReceiveProps(newProps) {
        const { id } = this.props.params
        const { newId } = newProps

        if (newId != id) {
            if (!newId) {
                this.setState({ complaint: this.state.initComplaint })
                this.clearListeners.forEach(listener => listener())
            } else {
                this.loadComplaint(newProps)
            }
        }
    }

    onGuiUpdate() {
        this.updateDatePickers()

        autosize($('textarea'))
    }

    componentDidMount() {
        this.loadComplaintTypes()
        this.loadActiveTermId()
        this.loadComplaint()

        this.onGuiUpdate()
    }

    componentDidUpdate() {
        this.onGuiUpdate()
    }

    renderForm() {
        const {
            complaintTypes,
            complaint
        } = this.state

        const removeTime = date => (date && date.length > 0) ? date.split(' ')[0] : date

        return (
            <div>
                <Row>
                    <Col md={6} style={{ marginBottom: '10px' }}>
                        <Label>Name of complainant</Label>
                        <input
                            name='name'
                            value={complaint.name}
                            type='text'
                            className='form-control'
                            onChange={this.onChange}
                        />
                    </Col>

                    <Col md={6} style={{ marginBottom: '10px' }}>
                        <Label>Complaint recorded by</Label>
                        <input
                            name='recordedBy'
                            value={complaint.recordedBy}
                            type='text'
                            className='form-control'
                            onChange={this.onChange}
                        />
                    </Col>
                </Row>

                <Row>
                    <Col md={6} style={{ marginBottom: '10px' }}>
                        <Label>Person dealing with complaint</Label>
                        <input
                            name='handlerFullname'
                            value={complaint.handlerFullname}
                            type='text'
                            className='form-control'
                            onChange={this.onChange}
                        />
                    </Col>

                    <Col md={6} style={{ marginBottom: '10px' }}>
                        <Label>Date of Alleged Incident</Label>
                        <input
                            name='dateOfAllegedIncident'
                            value={complaint.dateOfAllegedIncident}
                            type='text'
                            className='form-control datepicker'
                            onChange={this.onChange}
                        />
                    </Col>
                </Row>

                <Row>
                    <Col md={6} style={{ marginBottom: '10px' }}>
                        <Label>Branch</Label>

                        <SourceSelect
                            url="/api/branches-associated/list"
                            className="form-control"
                            name="branchId"
                            id="branchId"
                            value={complaint.branchId}
                            onChange={this.onChange}
                        >
                            <option value='null'>None</option>
                        </SourceSelect>
                    </Col>

                    <Col md={6} style={{ marginBottom: '10px' }}>
                        <Label>Term</Label>

                        <SourceSelect
                            url="/api/terms/list"
                            className="form-control"
                            name="termId"
                            id="termId"
                            value={complaint.termId}
                            onChange={this.onChange}
                        >
                            <option value='null'>None</option>
                        </SourceSelect>
                    </Col>
                </Row>

                <Row>
                    <Col md={6} style={{ marginBottom: '10px' }}>
                        <Label>Complaint priority</Label>

                        <SourceSelect
                            url="/api/complaints/priorities"
                            name="priority"
                            id="priority"
                            value={complaint.priority}
                            onChange={this.onChange}
                            className="form-control"
                        />
                    </Col>

                    <Col md={6} style={{ marginBottom: '10px' }}>
                        <Label>Date of complaint</Label>
                        <input
                            name='createdAt'
                            value={removeTime(complaint.createdAt)}
                            type='text'
                            className='form-control datepicker'
                            onChange={this.onChange}
                        />
                    </Col>
                </Row>

                <Row>
                    <Col md={6} style={{ marginBottom: '10px' }}>
                        <Label>Complaint types</Label>

                        {complaintTypes.map(type => (
                            <div style={{ marginBottom: '5px' }} key={type.value}>
                                <input
                                    type="checkbox"
                                    name="types"
                                    className="form-control"
                                    style={{ display: 'inline-block', verticalAlign: 'middle' }}
                                    value={type.value}
                                    checked={complaint.types.includes(parseInt(type.value))}
                                    onChange={this.onMultiCheckboxChange}
                                />

                                <span style={{ display: 'inline-block', marginLeft: '10px' }}>
                                    {type.label}
                                </span>
                            </div>
                        ))}
                    </Col>

                    <Col md={6} style={{ marginBottom: '10px' }}>
                        <Label>Attach students</Label>

                        <UserList
                            initialData={complaint.users}
                            onUpdate={users => this.updateComplaint('users', users)}
                            onSendClearFunc={this.addClearListener}
                        />
                    </Col>
                </Row>

                <Row style={{ marginBottom: '10px' }}>
                    <Col md={12}>
                        <Label>Complaint</Label>

                        <RichEditor name='text' initHTML={complaint.text} onChange={this.onChange} />
                    </Col>
                </Row>

                <Row style={{ marginBottom: '10px' }}>
                    <Col md={12}>
                        <Label>Action taken</Label>

                        <RichEditor name='actionTaken' initHTML={complaint.actionTaken} onChange={this.onChange} />
                    </Col>
                </Row>

                <Row style={{ marginBottom: '10px' }}>
                    <Col md={12}>
                        <Label>Suggestions/Disposition</Label>

                        <RichEditor name='suggestions' initHTML={complaint.suggestions} onChange={this.onChange} />
                    </Col>
                </Row>

                <Row style={{ marginBottom: '10px' }}>
                    <Col md={12}>
                        <Label>Follow up/Other comments</Label>

                        <RichEditor name='otherComments' initHTML={complaint.otherComments} onChange={this.onChange} />
                    </Col>
                </Row>

                <Row>
                    <Col md={6} style={{ marginBottom: '10px' }}>
                        <Label>Action deadline</Label>
                        <input
                            name='actionDeadline'
                            value={removeTime(complaint.actionDeadline)}
                            type='text'
                            className='form-control datepicker'
                            onChange={this.onChange}
                        />
                    </Col>

                    <Col md={6} style={{ marginBottom: '10px' }}>
                        <Label>Completion date</Label>
                        <input
                            name='completionDate'
                            value={removeTime(complaint.completionDate)}
                            type='text'
                            className='form-control datepicker'
                            onChange={this.onChange}
                        />
                    </Col>
                </Row>
            </div>
        )
    }

    render() {
        const { isLoading, showConfirmDelete } = this.state
        const { id } = this.props.params

        if (isLoading) {
            return <Spinner />
        }

        return (
            <div className='content-block'>
                <h2 className='block-heading'>Add Complaint</h2>
                <hr/>

                {this.renderForm()}

                <Button className="custom btn-success" onClick={this.submit} style={styles.button}>Submit</Button>

                {id ?
                    <span>
                        <Button
                            style={styles.buttonAfter}
                            className="custom btn-success"
                            onClick={() => this.delete(false)}
                        >
                            Delete
                        </Button>

                        <Link
                            to={`/complaints/${id}/print`}
                            target="_blank"
                            style={{ textDecoration: 'none', color: 'white' }}
                        >
                            <Button
                                style={styles.buttonAfter}
                                className="custom btn-success"
                            >
                                Print
                            </Button>
                        </Link>
                    </span> : ''
                }

                <ConfirmDeleteWnd
                    show={showConfirmDelete}
                    onConfirm={reason => this.delete(true, reason)}
                    onClose={() => this.setState({ showConfirmDelete: false })}
                />
            </div>
        )
    }
}

ComplaintsEdit.contextTypes = {
    router: PropTypes.object.isRequired
}

