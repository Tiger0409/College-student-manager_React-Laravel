import React, { PropTypes, Component } from 'react'
import { FormField } from '../common/FormWidgets.jsx'
import { Row, Col, Button } from 'react-bootstrap'
import Auth from '../../utils/Auth.js'
import Notifier from '../../utils/Notifier.js'
import ObjHelper from '../../utils/ObjHelper.js'
import { ROLES } from '../../config/constants.js'
import ProfileForm from '../students/ProfileForm.jsx'
import DataLoader from '../common/DataLoader.jsx'
import { Link } from 'react-router'
import Ph from '../../utils/PromiseHelper.js'

export default class Login extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { userName: '', password: '' }
        this.onChange = this.onChange.bind(this)
        this.login = this.login.bind(this)
        this.next = this.next.bind(this)
        this.forgotPassword = this.forgotPassword.bind(this)
    }

    onChange(e) {
        this.setState({ [e.target.name]: e.target.value })
    }

    pushStoredItemsToCart() {
        const { router } = this.context

        let classes = localStorage.getItem('registeredClasses')
        if (classes == null) return

        classes = JSON.parse(classes)

        $.ajax({
            type: 'post',
            url: 'api/cart/add',
            data: { classes: classes },
            success: () => { localStorage.removeItem('registeredClasses'); router.push('/cart') },
            error: xhr => console.log(xhr)
        })
    }

    forgotPassword() {
        localStorage.setItem('forgotEmail', this.state.userName)
        this.context.router.push('/forgot-password')
    }

    next() {
        if (this.usernameCheckPm) {
            this.usernameCheckPm.cancel()
        }

        const { userName } = this.state

        this.usernameCheckPm = Ph.ajax({
            type: 'get',
            url: '/api/auth/check-username',
            data: { username: userName }
        })
        this.usernameCheckPm.then(
            () => {
                this.setState({ usernameSelected: true })
                $(() => $('[name="password"]').focus())
            },
            xhr => {
                localStorage.setItem('username', userName)
                this.context.router.push('/registration')
            }
        )
    }

    componentDidMount() {
        $(() => $('[name="userName"]').focus())
    }

    login() {
        const { userName, password } = this.state

        if (userName.length === 0) {
            Notifier.error('User name or email should not be empty')
            return
        }

        if (password.length === 0) {
            Notifier.error('Password should not be empty')
            return
        }


        Auth.login(userName, password).then(
            () => {
                this.pushStoredItemsToCart()
                this.props.onUserUpdate()
            },
            xhrObj => Notifier.error(xhrObj.responseText.replace(/"/g, ''))
        )
    }

    renderUserNameSelect() {
        const { userName } = this.state

        return (
            <div>
                <FormField width={12} label='Username / Email'>
                    <input
                        type='text'
                        className='form-control'
                        name='userName'
                        onChange={this.onChange}
                        value={userName}
                        onKeyPress={e => (e.charCode == 13 || e.keyCode == 13) && this.next()}
                    />
                </FormField>

                <Row>
                    <Col md={12}>
                        <Button onClick={this.next} bsStyle='primary' style={{ marginRight: '15px' }}>
                            Next
                        </Button>
                    </Col>
                </Row>
            </div>
        )
    }

    renderPasswordInput() {
        const { password } = this.state

        return (
            <div>
                <h3>
                    <a
                        onClick={e => {
                            e.preventDefault()
                            this.setState({ usernameSelected: false })
                        }}
                        style={{ cursor: 'pointer' }}
                    >
                        Log in using another account
                    </a>
                </h3>

                <FormField width={12} label='Password'>
                    <input
                        type='password'
                        className='form-control'
                        name='password'
                        onChange={this.onChange}
                        value={password}
                        onKeyPress={e => (e.charCode == 13 || e.keyCode == 13) && this.login()}
                    />
                </FormField>

                <Row>
                    <Col md={12}>
                        <Button onClick={this.login} bsStyle='primary' style={{ marginRight: '15px' }}>
                            Login
                        </Button>
                        <Button onClick={this.forgotPassword}>Forgot password</Button>
                    </Col>
                </Row>
            </div>
        )
    }

    render() {
        if (this.props.appTypeKey !== ROLES.GUEST) {
            this.context.router.push('/')
        }

        const { usernameSelected } = this.state

        return (
            <div>
                <div style={{ marginTop: '40px' }}>
                    <Row>
                        <Col mdOffset={3} md={6} smOffset={2} sm={8}>
                            <div id="notifications"></div>

                            <h2>Enter your email address</h2>

                            {usernameSelected ?
                                this.renderPasswordInput()
                                : this.renderUserNameSelect()
                            }
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }
}

Login.contextTypes = {
    router: PropTypes.object.isRequired
}

Login.propTypes = {
    appTypeKey: PropTypes.string,
    onUserUpdate: PropTypes.func
}