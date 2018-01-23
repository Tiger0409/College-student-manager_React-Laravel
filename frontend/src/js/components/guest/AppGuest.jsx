import React from 'react'
import HeaderGuest from './HeaderGuest.jsx'
import FooterGuest from './FooterGuest.jsx'
import { WebsiteHeader, WebsiteFooter } from './../common/Website.jsx'
import AuthComponent from './../common/AuthComponent.jsx'
import { Row, Col } from 'react-bootstrap'

export default class AppGuest extends React.Component {
    constructor(props, context) {
        super(props, context)
    }

    renderHeader() {
        return (
            <div>
                <HeaderGuest />
            </div>
        )
    }


    render() {
        return (
            <div>
                <WebsiteHeader/>
                <div className='container'>
                    {this.renderHeader()}
                    {this.props.children}
                    <FooterGuest/>
                </div>
                <WebsiteFooter/>
            </div>
        )
    }
}