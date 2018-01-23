import React, { PropTypes, Component } from 'react'
import { LabeledValue, FormField } from '../../common/FormWidgets.jsx'
import FormGroup from '../../common/FormGroup.jsx'
import PromiseHelper from '../../../utils/PromiseHelper.js'
import ObjHelper from '../../../utils/ObjHelper.js'
import StringHelper from '../../../utils/StringHelper.js'
import { Button, Row, Col } from 'react-bootstrap'
import { ROLES } from '../../../config/constants.js'
import Notifier from '../../../utils/Notifier.js'
import autosize from '../../../libs/autosize.js'
import Spinner from '../../common/Spinner.jsx'

export default class DonationRecordsDetail extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            isLoading: false,
            recordObj: {}
        }
        this.allowedRoles = [ROLES.ADMIN, ROLES.SUPER_ADMIN]
        this.promises = {save: null, load: null}
        this.requestFields = [
            'donation.title',
            'donation.donationType.type',
            'donation.targetAmount',
            'donation.PaymentMethod',
            'donation.paypalEmailAddress',
            'donation.paypalSandboxEmailAddress',
            'donationAmount',
            'isReceived',
            'term.name',
            'name',
            'notes',
            'anotes',
            'user.userEmailAddress',
            'phoneNumber',
            'user.profile.telephone',
            'user.profile.number',
            'paypalTransaction.fullDetails'
        ]
        this.handleFieldChange = this.handleFieldChange.bind(this)
        this.back = this.back.bind(this)
        this.submit = this.submit.bind(this)
    }

    isAllowed() {
        const { appTypeKey } = this.props
        return this.allowedRoles.indexOf(appTypeKey) !== -1
    }

    load() {
        const { id } = this.props.params
        if (!id) return

        this.setState({isLoading: true})

        this.promises.load = PromiseHelper.ajax({
            type: 'get',
            url: '/api/donation-records/' + id,
            data: {fields: this.requestFields}
        })
        this.promises.load.then(
            data => {
                this.setState({isLoading: false, recordObj: data})
                $(() => autosize($('textarea')))
            },
            xhr => { this.setState({isLoading: false}), console.log(xhr) }
        )
    }

    save() {
        const { recordObj } = this.state
        const { params: { id } } = this.props
        if (!id) return

        this.promises.save = PromiseHelper.ajax({
            type: 'put',
            url: '/api/donation-records/' + id,
            data: {
                donationAmount: parseFloat(recordObj.donationAmount),
                notes: recordObj.notes,
                anotes: recordObj.anotes
            }
        })
        this.promises.save.then(
            xhr => {
                Notifier.success('Updated')
                console.log(xhr)
            },
            xhr => {
                Notifier.error('Update failed')
                console.log(xhr)
            }
        )
    }

    componentWillMount() {
        if (this.isAllowed())
            this.load()
    }

    componentWillUnmount() {
        for (let key in this.promises)
            if (this.promises[key]) this.promises[key].cancel()
    }

    handleFieldChange(e) {
        var { recordObj } = this.state
        recordObj[e.target.name] = e.target.value
        this.setState({recordObj: recordObj})
    }

    submit(e) {
        e.preventDefault()
        this.save()
    }

    back() {
        this.context.router.goBack()
    }

    renderPaypalVars() {
        const { recordObj } = this.state
        const fullDetails = ObjHelper.accessObjByPath(recordObj, 'paypalTransaction.fullDetails')

        if (!fullDetails) return false

        var output = []
        for (let key in fullDetails) {
            let formattedLavel = StringHelper.ucWords(key.replace(/_/g, ''))

            output.push(
                <LabeledValue key={key} label={formattedLavel} value={fullDetails[key]} />
            )
        }

        return (
            <div>
                <p style={{fontWidth: 'bold'}}>Paypal Variables</p>
                {output}
            </div>
        )
    }

    renderDetail() {
        const { recordObj } = this.state
        const get = ObjHelper.accessObjByPath

        return (
            <div>
                <form onSubmit={this.submit}>
                    <LabeledValue
                        label='Title'
                        value={get(recordObj, 'donation.title')}
                        asRow
                    />

                    <LabeledValue
                        label='Type'
                        value={get(recordObj, 'donation.donationType.type')}
                        asRow
                    />

                    <LabeledValue
                        label='Type'
                        value={'£ ' + get(recordObj, 'donation.targetAmount')}
                        asRow
                    />

                    <LabeledValue
                        label='Payment Method'
                        value={get(recordObj, 'donation.paymentMethod')}
                        asRow
                    />

                    <LabeledValue
                        label='Paypal Email Address'
                        value={get(recordObj, 'donation.paypalEmailAddress')}
                        asRow
                    />

                    <LabeledValue
                        label='Paypal Sandbox Email Address'
                        value={get(recordObj, 'donation.paypalSandboxEmailAddress')}
                        asRow
                    />

                    <LabeledValue
                        label='Type'
                        value={get(recordObj, 'donation.donationType.type')}
                        asRow
                    />

                    <FormField width={5} label='Donation Amount'>
                        <br/><span style={{marginRight: '10px'}}>£</span>
                        <input
                            style={{display: 'inline-block', width: '50%'}}
                            type='text'
                            className='form-control'
                            name='donationAmount'
                            value={recordObj.donationAmount}
                            onChange={this.handleFieldChange}
                        />
                    </FormField>

                    <LabeledValue
                        label='Donation Received?'
                        value={recordObj.isReceived ? 'Yes' : 'No'}
                    />

                    <LabeledValue
                        label='Donation term'
                        value={get(recordObj, 'term.name')}
                    />

                    <LabeledValue
                        label='Name'
                        value={recordObj.name}
                    />

                    <FormField width={12} label='Notes'>
                        <textarea
                            name='notes'
                            id='notes'
                            rows='2'
                            className='form-control'
                            value={recordObj.notes}
                            onChange={this.handleFieldChange}>
                        </textarea>
                    </FormField>

                    <FormField width={12} label='Admin Notes'>
                        <textarea
                            name='anotes'
                            id='anotes'
                            rows='2'
                            className='form-control'
                            value={recordObj.anotes}
                            onChange={this.handleFieldChange}>
                        </textarea>
                    </FormField>

                    <LabeledValue
                        label='User Email Address'
                        value={get(recordObj, 'user.userEmailAddress')}
                    />

                    <LabeledValue
                        label='Telephone'
                        value={get(recordObj, 'user.profile.profileTelephone')}
                    />

                    <LabeledValue
                        label='Mobile'
                        value={get(recordObj, 'user.profile.profileMobile')}
                    />

                    {this.renderPaypalVars()}

                    <FormGroup>
                        <Button bsStyle='info' style={{marginRight: '15px'}} type='submit'>Update</Button>
                        <Button bsStyle='warning' onClick={this.back}>Back</Button>
                    </FormGroup>
                </form>
            </div>
        )
    }

    render() {
        if (!this.isAllowed()) return false

        const { isLoading, recordObj } = this.state

        if (isLoading) return <div><Spinner /></div>

        if (!recordObj) return <p>Not found</p>

        return (
            <div>
                <h2>Donation Record Detail</h2>
                {this.renderDetail()}
            </div>
        )
    }
}
DonationRecordsDetail.PropTypes = {
    appTypeKey: PropTypes.string.isRequired,
    params: PropTypes.object.isRequired
}

DonationRecordsDetail.contextTypes = {
    router: PropTypes.object.isRequired
}