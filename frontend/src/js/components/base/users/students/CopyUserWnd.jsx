import React, { PropTypes, Component } from 'react'
import { Modal, Button } from 'react-bootstrap'
import { Html, FormField, DatePicker } from '../../../common/FormWidgets.jsx'
import Notifier from '../../../../utils/Notifier.js'

export default class CopyUserWnd extends Component {
    constructor(props, context) {
        super(props, context)
        this.defaultState = { firstName: '', lastName: '', gender: 'male', birthDate: '' }
        this.state = this.defaultState
        this.headerStyle = { textAlign: 'center', fontSize: '14pt' }
        this.copyCalled = false
        this.close = this.close.bind(this)
        this.copyUser = this.copyUser.bind(this)
        this.handleChangeEvent = this.handleChangeEvent.bind(this)
    }

    clear() {
        this.setState(this.defaultState)
    }

    close() {
        this.clear()
        this.copyCalled = false
        this.props.onClose()
    }

    copyUser() {
        if (this.copyCalled) return
        this.copyCalled = true

        const { originUserId, onCopy } = this.props

        $.ajax({
            type: 'post',
            url: `/api/users/${originUserId}/copy`,
            data: this.state,
            success: newUserId => {
                Notifier.success('User copied')
                onCopy(newUserId)
                this.close()
            },
            error: xhr => {
                Notifier.error('Copy failed')
                console.error(xhr)
                this.close()
            }
        })
    }

    handleChangeEvent(e) {
        this.setState({ [e.target.name]: e.target.value })
    }

    updateDatePickers() {
        console.log('update dp')
        DatePicker.init((name, value) => this.setState({ [name]: value }))
    }

    componentDidMount() {
        this.updateDatePickers()
    }

    componentDidUpdate() {
        this.updateDatePickers()
    }

    render() {
        const { show } = this.props
        const { firstName, lastName, gender, birthDate } = this.state

        return (
            <Modal show={show} onHide={this.close}>
                <Modal.Dialog>
                    <Modal.Header closeButton>
                        <p style={this.headerStyle}>Copy user</p>
                    </Modal.Header>

                    <Modal.Body>
                        <FormField label='First name' width={12}>
                            <input
                                type='text'
                                name='firstName'
                                className='form-control'
                                value={firstName}
                                onChange={this.handleChangeEvent}
                            />
                        </FormField>

                        <FormField label='Last name' width={12}>
                            <input
                                type='text'
                                name='lastName'
                                className='form-control'
                                value={lastName}
                                onChange={this.handleChangeEvent}
                            />
                        </FormField>

                        <FormField label='Gender' width={12}>
                            <select
                                name='gender'
                                className='form-control'
                                value={gender}
                                onChange={this.handleChangeEvent}
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </FormField>

                        <FormField label='Birth Date' width={12}>
                            <input
                                type='text'
                                name='birthDate'
                                className='form-control datepicker'
                                value={birthDate}
                                onChange={this.handleChangeEvent}
                            />
                        </FormField>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button onClick={this.close}>Cancel</Button>
                        <Button onClick={this.copyUser} style={{ marginLeft: '15px' }}>Copy</Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal>
        )
    }
}

CopyUserWnd.propTypes = {
    originUserId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    onCopy: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    show: PropTypes.bool
}