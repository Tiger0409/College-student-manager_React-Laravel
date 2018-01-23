import React, { PropTypes, Component } from 'react'
import Ph from '../../utils/PromiseHelper.js'
import Notifier from '../../utils/Notifier.js'
import { FormField } from '../common/FormWidgets.jsx'
import { Button } from 'react-bootstrap'
import Spinner from '../common/Spinner.jsx'

export default class ResetPassword extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { isLoaded: false, newPassword: '', newPasswordConfirm: '', passwordReseted: false }
        this.onChange = this.onChange.bind(this)
        this.submit = this.submit.bind(this)
    }

    load() {
        const { resetCode, userId } = this.props.params
        const { router } = this.context

        if (this.promise) this.promise.cancel()

        this.promise = Ph.ajax({
            type: 'get',
            url: `/api/users/reset-password/${resetCode}/${userId}`
        })

        this.promise.then(
            () => this.setState({ isLoaded: true }),
            xhr => {
                Notifier.error(xhr.responseText.replace(/"/g, ''), 5000)
                router.push('/')
            }
        )
    }

    onChange(e) {
        const { name, value } = e.target
        this.setState({ [name]: value })
    }

    submit() {
        const { resetCode, userId } = this.props.params
        const { newPassword, newPasswordConfirm } = this.state

        if (!newPassword) {
            Notifier.error('Enter new password')
            return
        }

        if (newPassword !== newPasswordConfirm) {
            Notifier.error('Passwords should match')
            return
        }

        if (this.promise) this.promise.cancel()

        this.promise = Ph.ajax({
            type: 'post',
            url: '/api/users/reset-password',
            data: {
                resetCode: resetCode,
                userId: userId,
                newPassword: newPassword,
                newPasswordConfirm: newPasswordConfirm
            }
        })

        this.promise.then(
            () => this.setState({ passwordReseted: true }),
            xhr => Notifier.error(xhr.responseText.replace(/"/g, ''))
        )
    }

    componentDidMount() {
        this.load()
    }

    render() {
        const { isLoaded, newPassword, newPasswordConfirm, passwordReseted } = this.state

        if (!isLoaded) return <div><Spinner /></div>

        if (passwordReseted) {
            return (
                <div>
                    <h2>New password is set</h2>

                    <p>You can login now using your new password</p>
                </div>
            )
        }

        return (
            <div style={{ marginTop: '15px' }}>
                <FormField width={6} offset={3} label='New Password'>
                    <input
                        className='form-control'
                        type='text'
                        name='newPassword'
                        value={newPassword}
                        onChange={this.onChange}
                    />
                </FormField>

                <FormField width={6} offset={3} label='Confirm New Password'>
                    <input
                        className='form-control'
                        type='text'
                        name='newPasswordConfirm'
                        value={newPasswordConfirm}
                        onChange={this.onChange}
                    />
                </FormField>

                <FormField width={6} offset={3}>
                    <Button onClick={this.submit}>Submit</Button>
                    <Button
                        style={{ marginLeft: '15px' }}
                        onClick={() => this.context.router.push('/')}
                    >
                        Cancel
                    </Button>
                </FormField>
            </div>
        )
    }
}

ResetPassword.contextTypes = {
    router: PropTypes.object.isRequired
}