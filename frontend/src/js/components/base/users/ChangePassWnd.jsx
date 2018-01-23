import React, { PropTypes, Component } from 'react'
import { Modal, Button } from 'react-bootstrap'
import Ph from '../../../utils/PromiseHelper.js'
import { FormField } from '../../common/FormWidgets.jsx'
import Notifier from '../../../utils/Notifier.js'

export default class ChangePassWnd extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { userPassword: '', userPasswordConfirm: '' }
        this.close = this.close.bind(this)
        this.submit = this.submit.bind(this)
        this.onChange = this.onChange.bind(this)
    }

    close() {
        this.props.onClose()
    }

    submit() {
        const { userId } = this.props
        const { userPassword, userPasswordConfirm } = this.state

        if (userPassword == '') {
            Notifier.error('Type new password')
            return
        }

        if (userPassword != userPasswordConfirm) {
            Notifier.error('Passwords should match')
            return
        }

        if (this.promise) this.promise.cancel()

        this.promise = Ph.ajax({
            type: 'put',
            url: `/api/users/${userId}`,
            data: { userPassword: userPassword }
        })

        this.promise.then(
            () => Notifier.success('Password has been changed'),
            xhr => {
                Notifier.error('Password was not changed')
                console.error(xhr)
            }
        )

        this.close()
    }

    onChange(e) {
        const { name, value } = e.target
        this.setState({ [name]: value })
    }

    render() {
        const { show } = this.props
        const { userPassword, userPasswordConfirm } = this.state

        return (
            <Modal show={show} onHide={this.close}>
                <Modal.Dialog>
                    <Modal.Header closeButton>
                        <h3>Change password</h3>
                    </Modal.Header>

                    <Modal.Body>
                        <FormField width={12} label='New password'>
                            <input
                                type='text'
                                name='userPassword'
                                className='form-control'
                                value={userPassword}
                                onChange={this.onChange}
                            />
                        </FormField>

                        <FormField width={12} label='Confirm'>
                            <input
                                type='text'
                                name='userPasswordConfirm'
                                className='form-control'
                                value={userPasswordConfirm}
                                onChange={this.onChange}
                            />
                        </FormField>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button onClick={this.submit} style={{ marginRight: '15px' }}>OK</Button>
                        <Button onClick={this.close}>Cancel</Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal>
        )
    }
}

ChangePassWnd.propTypes = {
    show: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    userId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired
}