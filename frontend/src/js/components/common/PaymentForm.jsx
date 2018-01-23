import React, { PropTypes, Component } from 'react'
import { Row, Col, Button, Panel } from 'react-bootstrap'
import Notifier from '../../utils/Notifier.js'
import AssetManager from '../../utils/AssetManager.js'
import { STRIPE_PUBLIC_KEY } from '../../config/constants.js'
import Spinner from './Spinner.jsx'
import StripeHelper from '../../utils/StripeHelper.js'
import CreditCardForm from './CreditCardForm.jsx'
import PaymentHelper from '../../utils/PaymentHelper.js'

function width(val) {
    return { md: val, sm: val, xs: val }
}

function offset(val) {
    return { mdOffset: val, smOffset: val, xsOffset: val }
}

export default class PaymentForm extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            method: 'stripe',
            otherPaymentMethod: '',
            creditCard: {},
            processing: false,
            isLoading: false,
            availableMethods: ['stripe', 'paypal']
        }
        this.assetManager = new AssetManager()
        this.onChange = this.onChange.bind(this)
        this.next = this.next.bind(this)
    }

    next() {
        if (this.state.processing) {
            return
        }

        const { router } = this.context
        const { creditCard, otherPaymentMethod } = this.state
        const { type, url, params } = this.props
        let { method } = this.state

        if (method == 'stripe') {
            const validationResult = CreditCardForm.validate(creditCard)
            if (!validationResult.isValid) {
                validationResult.errors.forEach(error => Notifier.error(error))
                return
            }
        }

        this.setState({ processing: true })

        if (method === 'other') method = otherPaymentMethod
        PaymentHelper.processPayment(method, { method, type, url, params, creditCard },
            () => {
                router.push('/payment/success')
                this.props.onClose && this.props.onClose()
                this.setState({ processing: false })
            },
            () => {
                Notifier.error('Payment has failed, please check the details and try again')
                this.setState({ processing: false })
            }
        )
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

    componentWillUnmount() {
        this.assetManager.unloadAll()
    }

    componentWillMount() {
        this.assetManager.loadJs('https://js.stripe.com/v2/', () => {
            StripeHelper.loadPublishableKey()
        })

        if (this.props.checkAvailableMethods) {
            this.setState({ isLoading: true })

            $.ajax({
                type: 'get',
                url: '/api/settings/get-allowed-payment-methods',
                success: data => {
                    const method = data.includes(this.state.method) ? this.state.method : (data.length > 0 ? data[0] : '')
                    this.setState({ availableMethods: data, isLoading: false, method: method })
                },
                error: xhr => {
                    Notifier.error('Unable to load available payment methods')
                    console.error(xhr)
                }
            })
        }
    }

    renderPaymentMethod({ img, currMethod, method, size, show }) {
        if (!show) return ''

        return (
            <Col {...width(size)} style={{ textAlign: 'center' }}>
                <input
                    type="radio"
                    name='method'
                    checked={currMethod == method}
                    value={method}
                    onChange={this.onChange}
                />
                <img src={img} style={{ width: '50%', marginLeft: 10 }} />
            </Col>
        )
    }

    render() {
        const { method, otherPaymentMethod, creditCard, processing, isLoading, availableMethods } = this.state
        let { otherMethods } = this.props

        if (!otherMethods) otherMethods = []

        if (isLoading) {
            return <Spinner />
        }

        const itemsCount = availableMethods.length + ((otherMethods && otherMethods.length > 0) ? 1 : 0)

        const size = 12 / itemsCount

        return (
            <Container>
                <div id="notifications"></div>

                <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>Payment</h2>

                <Row style={{ marginBottom: '50px' }}>
                    {this.renderPaymentMethod({
                        img: '/src/images/cc_logo.png',
                        currMethod: method,
                        method: 'stripe',
                        size: size,
                        show: availableMethods.includes('stripe')
                    })}

                    {this.renderPaymentMethod({
                        img: '/src/images/paypal_logo.png',
                        currMethod: method,
                        method: 'paypal',
                        size: size,
                        show: availableMethods.includes('paypal')
                    })}

                    {otherMethods.length > 0 ?
                        <Col {...width(size)} style={{ textAlign: 'center' }}>
                            <input
                                type="radio"
                                name='method'
                                checked={method == 'other'}
                                value='other'
                                onChange={this.onChange}
                            />
                            <span>Other</span>
                        </Col> : ''
                    }
                </Row>

                <Panel
                    collapsible
                    expanded={method === 'stripe'}
                    style={method !== 'stripe' ? { border: '0' } : {}}
                >
                    <CreditCardForm onChange={this.onChange} name='creditCard' value={creditCard} />
                </Panel>

                <Panel
                    collapsible
                    expanded={method === 'other'}
                    style={method !== 'other' ? { border: '0' } : {}}
                >
                    <Row>
                        <Col md={6} mdOffset={4}>
                            {otherMethods.map((method, i) => {
                                return (
                                    <div key={i}>
                                        <input
                                            type="radio"
                                            name='otherPaymentMethod'
                                            checked={otherPaymentMethod == method}
                                            value={method}
                                            onChange={this.onChange}
                                        />
                                        <span
                                            style={{
                                                display: 'inline-block',
                                                marginTop: '-15px',
                                                verticalAlign: 'middle'
                                            }}
                                        >
                                            {method}
                                        </span>
                                    </div>
                                )
                            })}
                        </Col>
                    </Row>
                </Panel>

                <Spinner show={processing} />

                <Row>
                    <Col {...width(4)} {...offset(4)}>
                        <Button style={{ width: '100%' }} onClick={this.next}>Next</Button>
                    </Col>
                </Row>
            </Container>
        )
    }
}

PaymentForm.propTypes = {
    url: PropTypes.string.isRequired,
    type: PropTypes.string,
    params: PropTypes.object,
    otherMethods: PropTypes.array,
    onClose: PropTypes.func,
    checkAvailableMethods: PropTypes.bool
}

PaymentForm.contextTypes = {
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
        maxWidth: '100%',
        marginLeft: 'auto',
        marginRight: 'auto'
    }

    return (
        <div style={style}>
            {children}
        </div>
    )
}