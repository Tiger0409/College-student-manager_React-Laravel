import React, { Component, PropTypes } from 'react'
import { ROLES } from '../../../config/constants.js'
import PromiseHelper from '../../../utils/PromiseHelper.js'
import { FormField, EditableHTML } from '../../common/FormWidgets.jsx'
import FormGroup from '../../common/FormGroup.jsx'
import SourceSelect from '../../common/SourceSelect.jsx'
import { Button, Row, Col } from 'react-bootstrap'
import Notifier from '../../../utils/Notifier.js'
import autosize from '../../../libs/autosize.js'
import Spinner from '../../common/Spinner.jsx'

export default class DonationsEdit extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            isLoading: false,
            donation: {}
        }
        this.allowedRoles = [ROLES.ADMIN, ROLES.SUPER_ADMIN]
        this.promises = {save: null, load: null}
        this.requestFields = [
            'id',
            'title',
            'donationTypeId',
            'targetAmount',
            'body',
            'notes',
            'isCalled',
            'isShown',
            'imageFileName',
            'paymentMethod'
        ]
        this.handleFieldChange = this.handleFieldChange.bind(this)
        this.back = this.back.bind(this)
        this.submit = this.submit.bind(this)
    }

    isAllowed() {
        const { appTypeKey } = this.props
        return this.allowedRoles.indexOf(appTypeKey) !== -1
    }

    componentWillMount() {
        this.loadData()
    }

    componentWillUnmount() {
        for (let key in this.promises)
            if (this.promises[key]) this.promises[key].cancel()
    }

    submit(e) {
        e.preventDefault()
        this.saveData()
    }

    handleFieldChange(e) {
        var { donation } = this.state
        var value = e.target.value
        if (e.target.type == 'checkbox')
            value = e.target.checked
        donation[e.target.name] = value
        this.setState({donation: donation})
    }

    loadData() {
        const { id } = this.props.params
        if (!id) return

        this.setState({isLoading: true})

        this.promises.load = PromiseHelper.ajax({
            type: 'get',
            url: '/api/donations/' + id,
            data: {fields: this.requestFields}
        })
        this.promises.load.then(
            data => {
                this.setState({isLoading: false, donation: data})
                $(() => autosize($('textarea')))
            },
            xhr => console.log(xhr)
        )
    }

    saveData() {
        const { id } = this.props.params
        const { donation } = this.state

        var ajaxParams = null
        if (id) {
            ajaxParams = {
                type: 'put',
                url: '/api/donations/' + id,
                data: donation
            }
        } else {
            ajaxParams = {
                type: 'post',
                url: '/api/donations',
                data: donation
            }
        }

        this.promises.save = PromiseHelper.ajax(ajaxParams)
        this.promises.save.then(
            data => {
                Notifier.success('Saved successfully')
                console.log(data)
                if (!id && data.id) this.redirectToCreated(data.id)
            },
            xhr => {
                Notifier.error('Save failed')
                console.log(xhr.responseText)
            }
        )
    }

    back() {
        this.context.router.push('/donations')
    }

    redirectToCreated(id) {
        this.context.router.push('/donations/' + id + '/edit')
    }

    renderForm() {
        const { donation } = this.state

        let colsStyle = { marginBottom: 10 }

        return (
            <div>
                <form onSubmit={this.submit}>
                    <Row>
                        <Col md={6} style={colsStyle}>
                            <Label>Title</Label>
                            <input
                                type='text' name='title' id='title' className='form-control'
                                value={donation.title} onChange={this.handleFieldChange}
                            />
                        </Col>

                        <Col md={6} style={colsStyle}>
                            <Label>Donation Type</Label>
                            <SourceSelect
                                name='donationTypeId'
                                id='donationTypeId'
                                url='/api/donations/types'
                                className='form-control'
                                value={donation.donationTypeId}
                                onChange={this.handleFieldChange}
                            >
                                <option value="-1">-- Select Donation Type --</option>
                            </SourceSelect>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6} style={colsStyle}>
                            <Label>Payment Method</Label>
                            <SourceSelect
                                name='paymentMethod'
                                id='paymentMethod'
                                url='/api/donations/payment-methods'
                                className='form-control'
                                value={donation.paymentMethod}
                                onChange={this.handleFieldChange}
                            >
                                <option value="-1">-- Select Payment Method --</option>
                            </SourceSelect>
                        </Col>

                        <Col md={6} style={colsStyle}>
                            <Label>Target Amount</Label>
                            <input
                                type='text' name='targetAmount' id='targetAmount' className='form-control'
                                value={donation.targetAmount} onChange={this.handleFieldChange}
                            />
                        </Col>
                    </Row>

                    <Label>Body Text</Label>
                    <EditableHTML
                        value={donation.body}
                        onChange={this.handleFieldChange}
                        name='body'
                        onlyEdit
                    />

                    <Row style={{ marginBottom: '20px' }}>
                        <FormField width={12} label='Admin Notes' style={colsStyle}>
                            <textarea
                                name="notes"
                                id="notes"
                                rows="2"
                                className="form-control"
                                value={donation.notes}
                                onChange={this.handleFieldChange}
                            >
                            </textarea>
                        </FormField>
                        <Col md={6} style={colsStyle}>
                            <Label>Did you manage to reach and get a positive response?</Label>
                            <input
                                style={{ display: 'block' }}
                                type='checkbox'
                                name='isCalled'
                                checked={donation.isCalled}
                                onChange={this.handleFieldChange}
                            />
                        </Col>

                        <Col md={6} style={colsStyle}>
                            <Label>Shown on front page?</Label>
                            <input
                                style={{ display: 'block' }}
                                type='checkbox'
                                name='isShown'
                                checked={donation.isShown}
                                onChange={this.handleFieldChange}
                            />
                        </Col>
                    </Row>

                    <FormGroup>
                        <Button className='custom btn-success' style={{ marginRight: '15px' }} type='submit'>Save</Button>
                        <Button className='custom' onClick={this.back}>Back</Button>
                    </FormGroup>
                </form>
            </div>
        )
    }

    render() {
        const { isLoading } = this.state

        if (!this.isAllowed()) return false

        if (isLoading) return <div><Spinner /></div>

        return (
            <div className='content-block' style={{ paddingTop: '35px' }}>
                {this.renderForm()}
            </div>
        )
    }
}

DonationsEdit.PropTypes = {
    appTypeKey: PropTypes.string.isRequired
}

DonationsEdit.contextTypes = {
    router: PropTypes.object.isRequired
}

const Label = ({ children }) => (<p className='detail-field-label'>{children}</p>)