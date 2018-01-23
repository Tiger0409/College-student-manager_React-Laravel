import React, { PropTypes, Component } from 'react'
import StripeHelper from '../../../../utils/StripeHelper.js'
import AssetManager from '../../../../utils/AssetManager.js'
import { Row, Col, Panel, Button } from 'react-bootstrap'
import CreditCardForm from '../../../common/CreditCardForm.jsx'
import Sh from '../../../../utils/StringHelper.js'
import Spinner from '../../../common/Spinner.jsx'
import PaymentHelper from '../../../../utils/PaymentHelper.js'
import Notifier from '../../../../utils/Notifier.js'

function width(val) {
    return { md: val, sm: val, xs: val }
}

function offset(val) {
    return { mdOffset: val, smOffset: val, xsOffset: val }
}

export default class StudentPaymentForm extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            method: '',
            creditCard: {},
            processing: false,
            receivedBy: '',
            staff: '',
            paymentCompleted: false,
            registeredStudents: []
        }
        this.assetManager = new AssetManager()
        this.paymentMethods = ['cash', 'cheque', 'transfer', 'stripe']

        this.onChange = this.onChange.bind(this)
        this.close = this.close.bind(this)
        this.submit = this.submit.bind(this)
        this.printReceipt = this.printReceipt.bind(this)
    }

    onChange() {
        let name, value

        switch (arguments.length) {
            case 1:
                const e = arguments[0]
                name = e.target.name
                value = e.target.value
                break
            case 2:
                name = arguments[0]
                value = arguments[1]
                break
        }
        this.setState({ [name]: value })
    }

    printReceipt() {
        const { registeredStudents } = this.state
        const { router } = this.context

        router.push(`/students/print-receipt-rows/${registeredStudents}`)
    }

    close() {
        this.props.onClose()
    }

    submit() {
        if (this.state.processing) {
            return
        }

        const { router } = this.context
        let { creditCard, receivedBy, staff, method } = this.state
        let { type, url, params, onComplete } = this.props

        if (method === 'stripe') {
            let result = CreditCardForm.validate(creditCard)
            if (!result.isValid) {
                result.errors.forEach(error => Notifier.error(error))
                return
            }
        }

        this.setState({ processing: true })

        params = Object.assign({ receivedBy, staff }, params)

        PaymentHelper.processPayment(method, { method, type, url, params, creditCard },
            studentIds => {
                onComplete()
                this.setState({ processing: false, paymentCompleted: true, registeredStudents: studentIds })
            },
            xhr => {
                Notifier.error('Payment has failed, please check the details and try again!', 'paymentNotifications')
                console.log(xhr)
                this.setState({ processing: false })
            }
        )
    }

    getTotalAmount() {
        const { prices } = this.props
        const { method } = this.state
        const prop = method === 'stripe' ? 'priceWithSurcharge' : 'price'

        let sum = prices.reduce((prev, item) => prev + parseFloat(item[prop]), 0.0)

        return sum.toFixed(2)
    }

    componentWillUnmount() {
        this.assetManager.unloadAll()
    }

    componentWillMount() {
        this.assetManager.loadJs('https://js.stripe.com/v2/', () => {
            StripeHelper.loadPublishableKey()
        })
    }

    renderPaymentForm() {
        const { receivedBy, staff, method, creditCard, processing } = this.state

        if (processing) return <Spinner />

        return (
            <div>
                <h3 style={{ textAlign: 'center' }}>Payment</h3>

                <p>Total : {this.getTotalAmount()} £</p>

                <Row style={{ margin: '10px 0 10px 0px' }}>
                    <Col md={6}>
                        <input
                            type='text'
                            name='receivedBy'
                            value={receivedBy}
                            onChange={this.onChange}
                            className='form-control'
                            placeholder='Received By'
                        />
                    </Col>

                    <Col md={6}>
                        <input
                            type='text'
                            name='staff'
                            value={staff}
                            onChange={this.onChange}
                            className='form-control'
                            placeholder='Staff'
                        />
                    </Col>
                </Row>

                <Row style={{ marginBottom: '10px' }}>
                    <Col md={6} mdOffset={3}>
                        <select value={method} name='method' className='form-control' onChange={this.onChange}>
                            <option value="">Select payment method</option>
                            {this.paymentMethods.map((method, i) => (
                                <option key={i} value={method}>{Sh.ucFirst(method)}</option>
                            ))}
                        </select>
                    </Col>
                </Row>

                <Panel
                    collapsible
                    expanded={method === 'stripe'}
                    style={method !== 'stripe' ? { border: '0' } : {}}
                >
                    <CreditCardForm onChange={this.onChange} name='creditCard' value={creditCard} />
                </Panel>

                <Row>
                    <Col md={4} mdOffset={2}>
                        <Button style={{ width: '100%' }} onClick={this.close}>Cancel</Button>
                    </Col>

                    <Col md={4}>
                        <Button style={{ width: '100%'}} onClick={this.submit}>Submit</Button>
                    </Col>
                </Row>
            </div>
        )
    }

    renderSuccessPaymentView() {
        return (
            <div>
                <h3 style={{ textAlign: 'center' }}>Payment Completed!</h3>

                <Row style={{ margin: '20px 0px 40px 0px' }}>
                    <Col md={4} mdOffset={2}>
                        <Button style={{ width: '100%' }} onClick={this.printReceipt}>Print Receipt</Button>
                    </Col>

                    <Col md={4}>
                        <Button style={{ width: '100%'}} onClick={this.close}>Close</Button>
                    </Col>
                </Row>
            </div>
        )
    }

    render() {
        const { paymentCompleted } = this.state

        return (
            <Container>
                <div id="paymentNotifications"></div>

                {!paymentCompleted ? this.renderPaymentForm() : this.renderSuccessPaymentView()}
            </Container>
        )
    }
}

StudentPaymentForm.propTypes = {
    url: PropTypes.string.isRequired,
    type: PropTypes.string,
    params: PropTypes.object,
    prices: PropTypes.array.isRequired,
    onClose: PropTypes.func,
    onComplete: PropTypes.func
}

StudentPaymentForm.contextTypes = {
    router: PropTypes.object.isRequired
}

const Container = ({ children }) => {
    const style = {
        backgroundColor: 'white',
        padding: '1px 30px 10px 30px',
        marginTop: '20px',
        border: '2px solid #dad9d8',
        borderRadius: '3px',
        width: '580px',
        marginLeft: 'auto',
        marginRight: 'auto'
    }

    return (
        <div style={style}>
            {children}
        </div>
    )
}