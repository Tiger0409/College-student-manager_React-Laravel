import React, { PropTypes, Component } from 'react'
import DataLoader from '../../../common/DataLoader.jsx'
import { Modal, Button, Col, Row } from 'react-bootstrap'
import { FormField, Select } from '../../../common/FormWidgets.jsx'
import Notifier from '../../../../utils/Notifier.js'
import autosize from '../../../../libs/autosize.js'

class AddDonationWindow extends Component {
    constructor(props, context) {
        super(props, context)
        this.onChange = this.onChange.bind(this)
        this.state = { moneySource: 'my money', donationAmount: 0 }
        this.save = this.save.bind(this)
        this.close = this.close.bind(this)
    }

    changeState(stateProp, value) {
        this.setState({ [stateProp]: value })
    }

    onChange(e) {
        this.changeState(e.target.name, e.target.value)
    }

    close() {
        this.clearState()
        this.props.onClose()
    }

    clearState() {
        for (let prop in this.state) {
            if (prop !== 'paymentMethods') {
                this.setState({ [prop]: '' })
            }
        }
    }

    save() {
        const { save, userId } = this.props

        let data = this.state
        Object.assign(data, {
            userId: userId
        })

        save({ data: data },
            () => {
                this.close()
            },
            () => {
                this.close()
            }
        )
    }

    componentDidMount() {
        const { execute } = this.props
        const { paymentMethods } = this.state

        if (!paymentMethods) {
            execute('loadPaymentMethods', null, data => {
                this.setState({ paymentMethods: data, paymentMethod: data[0].value })
            })
        }

        $(() => autosize($('textarea')))
    }

    render() {
        const {
            paymentMethods,
            donationAmount,
            paymentMethod,
            notes,
            name,
            anotes,
            isUkTaxPayer,
            moneySource,
            isNotGettingTicket
        } = this.state

        const { show, style } = this.props

        return (
            <Modal show={show}>
                <Modal.Dialog>
                    <Modal.Header>
                        <Modal.Title>Add new donation record</Modal.Title>
                    </Modal.Header>

                    <Modal.Body style={style}>
                        <FormField width={6} label='Donation Amount £'>
                            <input
                                type='text'
                                className='form-control'
                                name='donationAmount'
                                onChange={this.onChange}
                                value={donationAmount}
                            />
                        </FormField>

                        <FormField width={6} label='Payment Method'>
                            <Select
                                name='paymentMethod'
                                onChange={this.onChange}
                                options={paymentMethods}
                                value={paymentMethod}
                            />
                        </FormField>

                        <FormField width={6} label='Name'>
                            <input
                                type='text'
                                className='form-control'
                                name='name'
                                onChange={this.onChange}
                                value={name}
                            />
                        </FormField>

                        <FormField width={12} label='Notes'>
                            <textarea
                                name='notes'
                                rows='2'
                                className='form-control'
                                onChange={this.onChange}
                                value={notes}
                            ></textarea>
                        </FormField>

                        <FormField width={12} label='Admin Notes'>
                            <textarea
                                name='anotes'
                                rows='2'
                                className='form-control'
                                onChange={this.onChange}
                                value={anotes}
                            ></textarea>
                        </FormField>
                        <Col md={12} style={{ marginTop: 10 }}>
                            <input
                                type='radio'
                                name='moneySource'
                                onChange={this.onChange}
                                value='my money'
                                checked={moneySource == 'my money'}
                                style={{ marginRight: 7 }}
                            />
                            <span>This is my money</span>
                        </Col>
                        <Col md={12} style={{ marginTop: 10 }}>
                            <input
                                type='radio'
                                name='moneySource'
                                onChange={this.onChange}
                                value='other'
                                checked={moneySource == 'other'}
                                style={{ marginRight: 7 }}
                            />
                            <span>I'm donating on behalf of a group, company, or someone else</span>
                        </Col>
                        <Col md={12} style={{ marginTop: 10 }}>
                            <input
                                type='checkbox'
                                name='isNotGettingTicket'
                                checked={!isNotGettingTicket}
                                onChange={this.onChange}
                                style={{ marginTop: '0', alignSelf: 'center', marginRight: 7 }}
                            />

                            <span style={{ marginLeft: '5px', alignSelf: 'center' }}>
                                I'm getting a ticket, product, or service in return for my donation
                            </span>
                        </Col>
                        <Col md={12} style={{ marginTop: 10 }}>
                            <input
                                type='radio'
                                name='isUkTaxPayer'
                                onChange={this.onChange}
                                value='1'
                                checked={isUkTaxPayer == '1'}
                                style={{ marginRight: 7 }}
                            />
                            <span>I am a UK taxpayer - please reclaim Gift Aid on my donation</span>
                        </Col>
                        <Col md={12} style={{ marginTop: 10 }}>
                            <input
                                type='radio'
                                name='isUkTaxPayer'
                                onChange={this.onChange}
                                value='0'
                                checked={isUkTaxPayer != '1'}
                                style={{ marginRight: 7 }}
                            />
                            <span>I am not a UK taxpayer</span>
                        </Col>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button onClick={this.close}>Cancel</Button>
                        <Button onClick={this.save} bsStyle='success'>Save</Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal>
        )
    }
}

export default DataLoader(
    AddDonationWindow,
    {
        loadPaymentMethods: { type: 'get', url: '/api/donation-records/get-payment-method-enum' },
        save: { type: 'post', url: '/api/donation-records' }
    }
)