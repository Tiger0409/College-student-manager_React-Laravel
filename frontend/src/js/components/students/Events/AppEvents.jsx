import React, { PropTypes, Component } from 'react'
import NavigationBar from './NavigationBar.jsx'
import ClassesAvailable from './ClassesAvailable.jsx'
import MyCourses from './MyCourses.jsx'
import Donations from './Donations.jsx'
import Cart from './Cart.jsx'
import PaymentStudent from './PaymentStudent.jsx'
import { WebsiteComponent, WebsiteHeader, WebsiteFooter } from '../../common/Website.jsx'

export default class AppEvents extends Component {
    constructor(props, context) {
        super(props, context)
    }

    static getClassesAvailable() {
        return ClassesAvailable
    }

    static getMyCourses() {
        return MyCourses
    }

    static getDonations() {
        return Donations
    }

    static getCart() {
        return Cart
    }

    static getHome() {
        return '/classes/available'
    }

    static getPaymentStudent(){
        return PaymentStudent
    }

    renderHeader() {
        const { user } = this.context

        return (
            <div>
                { user ?
                    <NavigationBar onUserUpdate={this.props.onUserUpdate} /> : ''
                }
            </div>
        )
    }

    render() {
        const { header, footer } = this.context.website

        return (
            <div>
                <WebsiteComponent id="header" template={header} />
                <div className='container'>
                    {this.renderHeader()}
                    {this.props.children}
                </div>
                <WebsiteComponent id="footer" template={footer} />
            </div>
        )
    }
}

AppEvents.propTypes = {
    onUserUpdate: PropTypes.func.isRequired
}

AppEvents.contextTypes = {
    user: PropTypes.object,
    website: PropTypes.object.isRequired
}