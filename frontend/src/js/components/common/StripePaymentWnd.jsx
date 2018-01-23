import React, { PropTypes, Component } from 'react'
import { Modal, Row, Col, Button } from 'react-bootstrap'
import CreditCardForm from './CreditCardForm.jsx'
import StripeHelper from '../../utils/StripeHelper.js'
import Spinner from './Spinner.jsx'
import Notifier from '../../utils/Notifier.js'
import AssetManager from '../../utils/AssetManager.js'
import { STRIPE_PUBLIC_KEY } from '../../config/constants.js'

let styles = {
    modalContentInner: { padding: 40 }
}

if (window.innerWidth < 1024) {
    styles = {
        modalContentInner: { padding: 10 }
    }
}

export default class StripePaymentWnd extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { creditCard: {}, processing: false, amount: 0 }
        this.onChange = this.onChange.bind(this)
        this.close = this.close.bind(this)
        this.submit = this.submit.bind(this)
        this.assetManager = new AssetManager()
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

    close(update) {
        this.setState({ creditCard: {} })
        this.props.onClose(update)
    }

    submit() {
        const { creditCard, amount } = this.state
        const { studentId } = this.props

        const result = CreditCardForm.validate(creditCard)
        if (!result.isValid) {
            result.errors.forEach(error => Notifier.error(error, { boxId: 'paymentNotifications' }))
            return
        }

        this.setState({ processing: true })
        const onEnd = () => this.setState({ processing: false })

        StripeHelper.processPayment({
            creditCard: creditCard,
            requestType: 'post',
            paymentUrl: '/api/student-payments/create',
            params: { amount: amount, studentId: studentId },
            onCardFail: () => { Notifier.error('Invalid card', { boxId: 'paymentNotifications' }), onEnd() },
            onSuccess: () => {
                this.close(true)
                Notifier.success('Payment completed')
                onEnd()
            },
            onError: xhr => {
                console.error(xhr)
                Notifier.error('Payment has failed, please check the details and try again', { boxId: 'paymentNotifications' })
                onEnd()
            }
        })
    }

    componentWillUnmount() {
        this.assetManager.unloadAll()
    }

    componentWillMount() {
        this.assetManager.loadJs('https://js.stripe.com/v2/', () => {
            StripeHelper.loadPublishableKey()
        })
    }

    render() {
        const { creditCard, processing, amount } = this.state
        const { show } = this.props

        return (
            <Modal show={show} onHide={() => this.close()}>
                <Modal.Dialog>
                    <Modal.Header closeButton>
                        <p style={{ textAlign: 'center', fontSize: '14pt' }}>
                            Complete Card Details
                        </p>
                    </Modal.Header>

                    <Modal.Body>
                        <div id="paymentNotifications"></div>

                        <div style={styles.modalContentInner}>
                            <Row style={{ marginBottom: '10px' }}>
                                <Col
                                    md={6} sm={6} xs={4}
                                    style={{ textAlign: 'center', margin: '0', height: '34px', lineHeight: '34px' }}
                                >
                                    <p>Amount: </p>
                                </Col>

                                <Col md={6} sm={6} xs={8}>
                                    <input
                                        type='text'
                                        className='form-control'
                                        name='amount'
                                        onChange={this.onChange}
                                        value={amount}
                                    />
                                </Col>
                            </Row>

                            <CreditCardForm
                                name='creditCard'
                                value={creditCard}
                                onChange={this.onChange}
                            />
                        </div>

                        <Spinner show={processing} />
                    </Modal.Body>

                    <Modal.Footer>
                        <Button
                            style={{ marginRight: '15px' }}
                            onClick={this.submit}
                            bsStyle='success'
                        >
                            Submit
                        </Button>
                        <Button onClick={() => this.close()}>Cancel</Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal>
        )
    }
}

StripePaymentWnd.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    studentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
}