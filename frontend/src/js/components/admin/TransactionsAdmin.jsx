import React from 'react'
import NavJustified from './../common/NavJustified.jsx'
import { LinkContainer } from 'react-router-bootstrap'
import { NavItem } from 'react-bootstrap'

export default class TransactionsAdmin extends React.Component {
    render() {
        return (
            <div className='admin-nav-secondary'>
                <div className='container'>
                    <NavJustified activeKey={1}>
                        <LinkContainer to={{ pathname: '/transactions/all' }}>
                            <NavItem eventKey={1}>All Transactions</NavItem>
                        </LinkContainer>

                        <LinkContainer to={{ pathname: '/transactions/paypal' }}>
                            <NavItem eventKey={2}>PayPal Transactions</NavItem>
                        </LinkContainer>

                        <LinkContainer to={{ pathname: '/transactions/stripe' }}>
                            <NavItem eventKey={3}>Stripe Transactions</NavItem>
                        </LinkContainer>
                    </NavJustified>
                </div>
            </div>
        )
    }
}