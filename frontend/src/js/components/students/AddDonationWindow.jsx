import React, { PropTypes, Component } from 'react'
import DataLoader from '../common/DataLoader.jsx'
import { Modal, Button, Row, Col } from 'react-bootstrap'
import { FormField, Select } from '../common/FormWidgets.jsx'
import Notifier from '../../utils/Notifier.js'
import autosize from '../../libs/autosize.js'

class AddDonationWindow extends Component {
    constructor(props, context) {
        super(props, context)
        this.onChange = this.onChange.bind(this)
        this.state = { moneySource: 'my money' }
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

    submit(donationRecord) {
        this.clearState()
        this.props.onSubmit(donationRecord)
        this.props.onClose()
    }

    clearState() {
        for (let prop in this.state) {
            this.setState({ [prop]: '' })
        }
    }

    save() {
        const { user } = this.context
        const { save, donationAmount } = this.props

        let data = this.state

        if (!data.name) {
            data.name = 'Anonymous'
        }

        Object.assign(data, {
            userId: user.id,
            isReceived: 0,
            isCalled: 0,
            donationAmount: parseFloat(donationAmount)
        })

        save({ data: data },
            donationRecord => {
                this.submit(donationRecord)
            },
            xhr => {
                Notifier.error('Error submitting donation')
                console.error(xhr)
            }
        )
    }

    componentDidMount() {
        $(() => autosize($('textarea')))
    }

    render() {
        const {
            notes,
            name,
            isUkTaxPayer,
            moneySource,
            isNotGettingTicket
        } = this.state

        const { show, donationAmount, style } = this.props

        return (
            <Modal show={show} onHide={this.close}>
                <Modal.Dialog>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <p>One Off Donation</p>
                            <h2><b>Your donation amount: £ {parseFloat(donationAmount).toFixed(2)}</b></h2>
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body style={style}>
                        <Row>
                            <Col md={12}>
                                <p>Your name (leave blank to be displayed as Anonymous)</p>
                            </Col>
                        </Row>

                        <FormField width={5}>
                            <input
                                type='text'
                                className='form-control'
                                name='name'
                                onChange={this.onChange}
                                value={name}
                            />
                        </FormField>

                        <FormField width={12} label='Leave a friendly comment'>
                            <textarea
                                name='notes'
                                rows='10'
                                className='form-control'
                                onChange={this.onChange}
                                style={{ height: '50px' }}
                                value={notes}
                            ></textarea>
                        </FormField>

                        <input
                            type='radio'
                            name='isUkTaxPayer'
                            onChange={this.onChange}
                            value='1'
                            checked={isUkTaxPayer == '1'}
                        />
                        <span>I am a UK taxpayer - please reclaim Gift Aid on my donation</span>

                        <div style={{ marginLeft: '10px' }}>
                            <input
                                type='radio'
                                name='moneySource'
                                onChange={this.onChange}
                                value='my money'
                                checked={moneySource == 'my money'}
                                />
                            <span>This is my money</span>

                            <br/>

                            <input
                                type='radio'
                                name='moneySource'
                                onChange={this.onChange}
                                value='other'
                                checked={moneySource == 'other'}
                                />
                            <span>I'm donating on behalf of a group, company, or someone else</span>

                            <br/>

                            <input
                                type='checkbox'
                                name='isNotGettingTicket'
                                checked={!isNotGettingTicket}
                                onChange={this.onChange}
                                />
                            <span>I'm getting a ticket, product, or service in return for my donation</span>
                        </div>

                        <input
                            type='radio'
                            name='isUkTaxPayer'
                            onChange={this.onChange}
                            value='0'
                            checked={isUkTaxPayer != '1'}
                            />
                        <span>I am not a UK taxpayer</span>
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

AddDonationWindow.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    donationAmount: PropTypes.any.isRequired,
    style: PropTypes.object
}

AddDonationWindow.contextTypes = {
    user: PropTypes.object.isRequired
}

export default DataLoader(AddDonationWindow, {
    save: { type: 'post', url: '/api/donation-records' }
})