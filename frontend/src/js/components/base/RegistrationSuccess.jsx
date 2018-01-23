import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'

export default class RegistrationSuccess extends Component {
    render() {
        return (
            <div>
                <h1>Registration successful</h1>

                <h2>You can <Link to='/login'>login</Link> now and start using your account</h2>
            </div>
        )
    }
}