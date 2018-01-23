import React, { Component, PropTypes } from 'react'
import { ROLES } from './../../config/constants.js'
import CourseHeaderAdmin from './../admin/CourseHeaderAdmin.jsx'
import PromiseHelper from './../../utils/PromiseHelper.js'
import { FormField } from './../common/FormWidgets.jsx'
import SourceSelect from './../common/SourceSelect.jsx'
import FormGroup from './../common/FormGroup.jsx'
import Notifier from '../../utils/Notifier.js'
import { Row, Button } from 'react-bootstrap'
import Spinner from '../common/Spinner.jsx'

export default class DeptsEdit extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            isLoading: false,
            deptObj: { deptName: '', weight: 0, deptBranchId: null }
        }
        this.allowedRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN]
        this.headerTypes = {
            [ROLES.SUPER_ADMIN]: CourseHeaderAdmin,
            [ROLES.ADMIN]: CourseHeaderAdmin
        }
        this.requestFields = ['deptName', 'weight', 'deptBranchId']
        this.promises = { load: null, save: null }
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

                <div className='content-block'>
                    <h2 className='block-heading'>Dept edit</h2>
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
                <ConcreteHeader selectedTab='/depts' />
            </div>
        )
    }

    renderForm() {
        let { deptObj } = this.state
        const { isLoading } = this.state

        if (isLoading) return (<div><Spinner /></div>)

        return (
            <div>
                <form onSubmit={e => this.submit(e)}>
                    <Row>
                        <FormField label='Name' width={5}>
                            <input
                                type='text' name='deptName' id='deptName' className='form-control'
                                value={deptObj.deptName} onChange={e => this.handleFieldChange(e)}/>
                        </FormField>

                        <FormField label='Weight' width={5}>
                            <input
                                type='text' name='weight' id='weight' className='form-control'
                                value={deptObj.weight} onChange={e => this.handleFieldChange(e)}/>
                        </FormField>

                        <FormField label='Branch' width={5}>
                            <SourceSelect
                                name='deptBranchId'
                                id='deptBranchId'
                                url='/api/dept-branches/list'
                                className='form-control'
                                value={deptObj.deptBranchId}
                                onChange={e => this.handleFieldChange(e)}
                                onLoad={
                                    data => {
                                        if (!data || data.length === 0) return

                                        if (!deptObj.deptBranchId) {
                                            deptObj.deptBranchId = data[0].value
                                            this.setState({ deptObj: deptObj })
                                        }
                                    }
                                }
                            >
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
        var { deptObj } = this.state
        deptObj[e.target.name] = e.target.value
        this.setState({ deptObj: deptObj })
    }

    submit(e) {
        e.preventDefault()
        this.save()
    }

    load() {
        const { id } = this.props.params
        if (!id) return

        this.setState({ isLoading: true })

        this.promises.load = PromiseHelper.ajax({
            type: 'get',
            url: '/api/depts/' + id,
            data: { fields: this.requestFields }
        })
        this.promises.load.then(
            data => this.setState({isLoading: false, deptObj: data}),
            xhr => console.log(xhr)
        )
    }

    save() {
        const { id } = this.props.params
        const { deptObj } = this.state

        var ajaxParams
        if (id)
            ajaxParams = {
                type: 'put',
                url: '/api/depts/' + id,
                data: deptObj
            }
        else
            ajaxParams = {
                type: 'post',
                url: '/api/depts',
                data: deptObj
            }

        this.promises.save = PromiseHelper.ajax(ajaxParams)
        this.promises.save.then(
            data => {
                Notifier.success('Saved successfully')
                this.context.router.push('/depts')
                console.log(data)
            },
            xhr => {
                Notifier.error('Save failed')
                console.log(xhr.responseText)
            }
        )
    }
}

DeptsEdit.PropTypes = {
    appTypeKey: PropTypes.string.isRequired
}

DeptsEdit.contextTypes = {
    router: PropTypes.object.isRequired
}