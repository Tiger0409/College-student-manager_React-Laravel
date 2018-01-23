import React, { PropTypes, Component } from 'react'
import DataLoader from '../../common/DataLoader.jsx'
import { Jumbotron, Button } from 'react-bootstrap'
import AddDonationWindow from '../AddDonationWindow.jsx'
import { Html } from '../../common/FormWidgets.jsx'
import Notifier from '../../../utils/Notifier.js'
import PaymentForm from '../../common/PaymentForm.jsx'
import autosize from '../../../libs/autosize.js'

class DonationsStudent extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            donationAmount: 0,
            typedAmount: '',
            showSubmitDialog: false,
            donationSubmitted: false,
            donationRecord: {},
            showPaymentForm: false
        }
        this.onTextChange = this.onTextChange.bind(this)
        this.onRadioChange = this.onRadioChange.bind(this)
        this.submit = this.submit.bind(this)
        this.onSubmitDonation = this.onSubmitDonation.bind(this)
        this.redirectToPaypal = this.redirectToPaypal.bind(this)
    }

    onRadioChange(e) {
        const { name, value } = e.target
        this.setState({ typedAmount: '', [name]: value })
    }

    onTextChange(e) {
        const { name, value } = e.target
        this.setState({ typedAmount: value, [name]: value })
    }

    submit() {
        const { donationAmount } = this.state

        if (parseFloat(donationAmount) <= 0) {
            alert('Select donation amount please')
            return
        }

        this.setState({ showSubmitDialog: true })
    }

    redirectToPaypal() {
        const { execute } = this.props
        const { donationRecord } = this.state
        execute('checkout', { donationId: donationRecord.id },
            data => {
                if (data.paypalForm) {
                    let decodedForm = $('<div/>').html(data.paypalForm).text()
                    $('body').append(decodedForm)
                    $("form[name='paypal_form']").submit()
                }
            },
            xhr => Notifier.error(xhr.responseText.replace(/"/g, ''))
        )
    }

    onSubmitDonation(donationRecord) {
        if (donationRecord) {
            //setTimeout(this.redirectToPaypal, 5000)
            this.setState({ donationRecord: donationRecord, showPaymentForm: true })
        }
    }

    componentDidMount() {
        $(() => {
            autosize($('textarea'))
        })
    }

    renderPreview() {
        const { data } = this.props
        const { donationAmount, typedAmount } = this.state

        return (
            <div>
                <Jumbotron>
                    <h2>One Off Donation</h2>

                    <Html>{data.body}</Html>

                    <div>
                        <div style={{ display: 'inline-block', marginRight: '15px' }}>
                            <input
                                type="radio"
                                value={10}
                                checked={donationAmount == 10 && !typedAmount}
                                name='donationAmount'
                                onChange={this.onRadioChange}
                            />
                            <span style={{ marginLeft: '10px' }}>£ 10</span>
                        </div>

                        <div style={{ display: 'inline-block', marginRight: '15px' }}>
                            <input
                                type="radio"
                                value={25}
                                checked={donationAmount == 25 && !typedAmount}
                                name='donationAmount'
                                onChange={this.onRadioChange}
                            />
                            <span style={{ marginLeft: '10px' }}>£ 25</span>
                        </div>

                        <div style={{ display: 'inline-block', marginRight: '15px' }}>
                            <input
                                type="radio"
                                value={50}
                                checked={donationAmount == 50 && !typedAmount}
                                name='donationAmount'
                                onChange={this.onRadioChange}
                            />
                            <span style={{ marginLeft: '10px' }}>£ 50</span>
                        </div>

                        <div style={{ display: 'inline-block', marginRight: '15px' }}>
                            <input
                                type='text'
                                className='form-control'
                                style={{ display: 'inline-block', width: '100px' }}
                                name='donationAmount'
                                onChange={this.onTextChange}
                            />
                            <span style={{ marginLeft: '10px' }}>Other</span>
                        </div>
                    </div>

                    <Button onClick={this.submit} bsStyle='primary'>Submit</Button>
                </Jumbotron>
            </div>
        )
    }

    renderPaypalRedirectScreen() {
        return (
            <div>
                <h2>Thank you for donating to us. You will be automatically redirected to paypal to complete the payment.</h2>

                <p>Click here if page was not redirected</p>
                <Button onClick={this.redirectToPaypal}>Go to paypal</Button>
            </div>
        )
    }

    render() {
        const { showSubmitDialog, donationAmount, donationRecord, showPaymentForm } = this.state

        if (showPaymentForm) {
            return (
                <PaymentForm
                    url='/api/donations/checkout'
                    type='post'
                    params={{ donationId: donationRecord.id }}
                />
            )
        }

        return (
            <div>
                {this.renderPreview()}

                <AddDonationWindow
                    show={showSubmitDialog}
                    donationAmount={donationAmount}
                    onClose={() => this.setState({ showSubmitDialog: false })}
                    style={{ maxHeight: '350px', overflowY: 'auto' }}
                    onSubmit={this.onSubmitDonation}
                />
            </div>
        )
    }
}

DonationsStudent.contextTypes = {
    router: PropTypes.object
}

export default DataLoader(DonationsStudent, {
    load: { type: 'get', url: '/api/donations/1', data: { fields: ['body'] } },
    checkout: { type: 'post', url: '/api/donations/checkout' },
})