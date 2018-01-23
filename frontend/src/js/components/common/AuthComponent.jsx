import React, { Component, PropTypes } from 'react'
import { Row, Col, Button, Nav, Navbar } from 'react-bootstrap'
import Auth from './../../utils/Auth.js'
import { Link } from 'react-router'
import Notifier from './../../utils/Notifier.js'

export default class AuthComponent extends React.Component {
    render() {
        const { style, isLogged, onUpdate } = this.props

        var ConcreteComponent = isLogged ?
            Logout : Login

        return (
            <div style={style}>
                <ConcreteComponent onUpdate={onUpdate} />
            </div>
        )
    }
}

class Login extends Component {
    render() {
        return (
            <div style={{ height: '35px' }}>
                <Button
                    bsStyle='success'
                    style={{ width: '100%' }}
                    onClick={() => this.login()}>
                    Login
                </Button>
            </div>
        )
    }

    login() {
        Auth.login().then(
            () => { this.props.onUpdate(); this.context.router.push('/') },
            xhrObj => Notifier.error('Authentication failed', xhrObj)
        )
    }
}

Login.contextTypes = {
    router: PropTypes.object.isRequired
}

class Logout extends Component {
    constructor(props, context) {
        super(props, context)
        this.logout = this.logout.bind(this)
    }

    logout() {
        Auth.logout().then(
            () => {
                this.props.onUpdate('')
            },
            xhrObj => {
                console.log('Logout failed', xhrObj)
                this.props.onUpdate()
            }
        )
    }

    render() {
        const { user } = this.context

        const userName = user ? (user.userFullname ? user.userFullname : user.userName) : ''

        return (
            <Row style={{ height: '35px' }} className='row-sm-10'>
                <Col md={3} sm={3} xs={3}>
                    <Link to={'/profile'}>
                        <img
                            className='icon-highlight'
                            src={'src/images/admin/profile_icon.png'}
                        />
                    </Link>
                </Col>

                <Col md={5} sm={6} xs={6}>
                    <p
                        style={{
                            fontFamily: 'Lato',
                            fontSize: '12pt',
                            color: 'white',
                            fontWeight: 'bold',
                            marginBottom: '0px'
                        }}
                    >
                        Logged in as
                    </p>

                    <p
                        style={{ fontFamily: 'Lato', fontSize: '12pt', color: '#f0a300', fontWeight: 'bold' }}
                    >
                        {userName ? userName : ''}
                    </p>
                </Col>

                <Col md={3} sm={3} xs={3}>
                    <img className='icon-highlight' src={'src/images/admin/log_icon.png'} onClick={this.logout} />
                </Col>
            </Row>
        )
    }
}

Logout.contextTypes = {
    user: PropTypes.object,
    router: PropTypes.object.isRequired
}