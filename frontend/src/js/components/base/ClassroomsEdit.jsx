import React, { Component, PropTypes } from 'react'
import { ROLES } from './../../config/constants.js'
import CourseHeaderAdmin from './../admin/CourseHeaderAdmin.jsx'
import PromiseHelper from './../../utils/PromiseHelper.js'
import { FormField } from './../common/FormWidgets.jsx'
import SourceSelect from './../common/SourceSelect.jsx'
import FormGroup from './../common/FormGroup.jsx'
import { Row, Button } from 'react-bootstrap'
import Notifier from '../../utils/Notifier.js'
import Spinner from '../common/Spinner.jsx'

export default class ClassroomsEdit extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            isLoading: false,
            classroomObj: { classroomName: '', branchId: null }
        }
        this.allowedRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN]
        this.headerTypes = {
            [ROLES.SUPER_ADMIN]: CourseHeaderAdmin,
            [ROLES.ADMIN]: CourseHeaderAdmin
        }
        this.requestFields = ['classroomName', 'branchId']
        this.promises = {load: null, save: null}
        this.submit = this.submit.bind(this)
    }

    componentWillMount() {
        this.load()
    }

    componentWillUnmount() {
        for (let key in this.promises)
            if (this.promises[key]) this.promises[key].cancel()
    }

    render() {
        return (
            <div>
                {this.renderHeader()}

                <div id="notifications"></div>

                <div className='content-block'>
                    <h2 className='block-heading'>Classroom edit</h2>
                    <hr />

                    {this.renderForm()}
                </div>
            </div>
        )
    }

    renderHeader() {
        const { appTypeKey } = this.props
        if (appTypeKey in this.headerTypes)
            var ConcreteHeader = this.headerTypes[appTypeKey]

        return (
            <div>
                <ConcreteHeader selectedTab='/classrooms' />
            </div>
        )
    }

    renderForm() {
        const { classroomObj, isLoading } = this.state

        if (isLoading) return (<div><Spinner /></div>)

        return (
            <div>
                <form onSubmit={this.submit}>
                    <Row>
                        <FormField label='Classroom Name' width={5}>
                            <input
                                type='text' name='classroomName' id='classroomName' className='form-control'
                                value={classroomObj.classroomName} onChange={e => this.handleFieldChange(e)}/>
                        </FormField>
                        <FormField label='Branch Name' width={5}>
                            <SourceSelect
                                name='branchId'
                                id='branchId'
                                url='/api/dept-branches/list'
                                className='form-control'
                                value={classroomObj.branchId}
                                onChange={e => this.handleFieldChange(e)}>
                                <option value="-1">-- Select Branch --</option>
                            </SourceSelect>
                        </FormField>
                    </Row>
                    <FormGroup>
                        <Button className='custom btn-success' type='submit'>Save</Button>
                    </FormGroup>
                </form>
            </div>
        )
    }

    handleFieldChange(e) {
        var { classroomObj } = this.state
        classroomObj[e.target.name] = e.target.value
        this.setState({classroomObj: classroomObj})
    }

    submit(e) {
        e.preventDefault()
        this.save()
    }

    load() {
        const { id } = this.props.params
        if (!id) return

        this.setState({isLoading: true})

        this.promises.load = PromiseHelper.ajax({
            type: 'get',
            url: '/api/classrooms/' + id,
            data: { fields: this.requestFields }
        })
        this.promises.load.then(
            data => this.setState({isLoading: false, classroomObj: data}),
            xhr => console.log(xhr)
        )
    }

    save() {
        const { id } = this.props.params
        const { classroomObj } = this.state
        const { router } = this.context

        var ajaxParams
        if (id)
            ajaxParams = {
                type: 'put',
                url: '/api/classrooms/' + id,
                data: classroomObj
            }
        else
            ajaxParams = {
                type: 'post',
                url: '/api/classrooms',
                data: classroomObj
            }

        this.promises.save = PromiseHelper.ajax(ajaxParams)
        this.promises.save.then(
            data => {
                Notifier.success('Saved successfully')
                router.push('/classrooms')
            },
            xhr => {
                Notifier.success('Save failed')
                console.log(xhr.responseText)
            }
        )
    }
}

ClassroomsEdit.propTypes = {
    appTypeKey: PropTypes.string.isRequired
}

ClassroomsEdit.contextTypes = {
    router: PropTypes.object.isRequired
}