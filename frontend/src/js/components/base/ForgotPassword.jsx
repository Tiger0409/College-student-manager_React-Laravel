import React, { PropTypes, Component } from 'react'
import { Row, Col, Button } from 'react-bootstrap'
import { Link } from 'react-router'
import Notifier from '../../utils/Notifier.js'
import Ph from '../../utils/PromiseHelper.js'

export default class ForgotPassword extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            userEmailAddress: localStorage.getItem('forgotEmail'),
            profileForname: '',
            profileSurname: '',
            profilePostcode: '',
            emailSent: false
        }

        localStorage.removeItem('forgotEmail')

        this.onChange = this.onChange.bind(this)
        this.onForgotPassClick = this.onForgotPassClick.bind(this)
    }

    onForgotPassClick() {
        const { userEmailAddress, profileForname, profileSurname, profilePostcode } = this.state

        if (!userEmailAddress && (!profileForname || !profileSurname || !profilePostcode)) {
            Notifier.error('Fill email or form bellow')
            return
        }

        const data = userEmailAddress ?
            { userEmailAddress: userEmailAddress } :
            {
                profileForname: profileForname,
                profileSurname: profileSurname,
                profilePostcode: profilePostcode
            }

        if (this.promise) this.promise.cancel()

        this.promise = Ph.ajax({
            type: 'post',
            url: '/api/users/forgot-password',
            data: data
        })

        this.promise.then(
            () => {
                Notifier.success('Check your email for reset password link')
                this.setState({ emailSent: true })
            },
            xhr => {
                Notifier.error(xhr.responseText.replace(/"/g, ''))
            }
        )
    }

    onChange(e) {
        const { name, value } = e.target
        this.setState({ [name]: value })
    }

    render() {
        const { userEmailAddress, profileForname, profileSurname, profilePostcode, emailSent } = this.state

        if (emailSent) {
            return (
                <div>
                    <Row>
                        <Col md={8} mdOffset={3}>
                            <h2>Reset code sent to email</h2>
                            <p>Please check your email and follow the instruction on resetting your password. If you have not recieved an email please also check your spam and junk mail.</p>
                        </Col>
                    </Row>
                </div>
            )
        }

        return (
            <div>
                <Row>
                    <Col md={6} mdOffset={3}>
                        <h2>Forgot your account password?</h2>

                        <p>Enter your email so we may email you your password</p>
                    </Col>
                </Row>

                <Row style={{ marginTop: '5px' }}>
                    <Col md={6} mdOffset={3}>
                        <p className='detail-field-label'>Your email address</p>

                        <input
                            type='text'
                            className='form-control'
                            name='userEmailAddress'
                            onChange={this.onChange}
                            value={userEmailAddress}
                        />
                    </Col>
                </Row>

                <Row>
                    <Col md={6} mdOffset={3}>
                        <hr
                            style={{
                                borderTop: '1px solid #CACACC',
                                borderRight: '0px none',
                                borderLeft: '0px none',
                                borderBottom: '0px none',
                                height: '1px',
                                marginTop: '40px'
                            }}
                        ></hr>
                    </Col>
                </Row>

                <Row style={{ marginBottom: '20px' }}>
                    <Col md={8} mdOffset={3}>
                        <p><b>Alternatively</b> complete the fields below to reset your password immediately</p>
                    </Col>
                </Row>

                <Row style={{ marginBottom: '5px' }}>
                    <Col md={6} mdOffset={3}>
                        <p className='detail-field-label'>Forname</p>

                        <input
                            type='text'
                            className='form-control'
                            name='profileForname'
                            onChange={this.onChange}
                            value={profileForname}
                        />
                    </Col>
                </Row>

                <Row style={{ marginBottom: '5px' }}>
                    <Col md={6} mdOffset={3}>
                        <p className='detail-field-label'>Surname</p>

                        <input
                            type='text'
                            className='form-control'
                            name='profileSurname'
                            onChange={this.onChange}
                            value={profileSurname}
                        />
                    </Col>
                </Row>

                <Row style={{ marginBottom: '5px' }}>
                    <Col md={6} mdOffset={3}>
                        <p className='detail-field-label'>Postcode</p>

                        <input
                            type='text'
                            className='form-control'
                            name='profilePostcode'
                            onChange={this.onChange}
                            value={profilePostcode}
                        />
                    </Col>
                </Row>

                <Row style={{ marginTop: '10px' }}>
                    <Col md={6} mdOffset={3}>
                        <Button onClick={this.onForgotPassClick}>Forgot Password</Button>
                        <Link to='/login'><Button style={{ marginLeft: '15px' }}>Cancel</Button></Link>
                    </Col>
                </Row>
            </div>
        )
    }
}