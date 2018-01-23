import React, { Component, PropTypes } from 'react'
import { Nav } from 'react-bootstrap'

export default class NavJustified extends Component {
    constructor (props) {
        super(props)
        this.state = {
            collapsible: false,
            hidden: false
        }
        this.handleNavbarToggleClick = this.handleNavbarToggleClick.bind(this)
        this.hideNavbar = this.hideNavbar.bind(this)
    }

    componentDidMount () {
        if (window.innerWidth < 768) {
            this.setState({
                collapsible: true,
                hidden: true
            })
        }
    }

    handleNavbarToggleClick (e) {
        e.preventDefault();
        const { hidden } = this.state
        this.setState({
            hidden: !hidden
        })
    }

    hideNavbar () {
        const { hidden } = this.state
        if (!hidden) {
            this.setState({
                hidden: true
            })
        }
    }

    renderNavbarToggle () {
        if (!this.state.collapsible) return null
        return (
            <button type="button" className="navbar-toggle" style={{ float: 'none' }} onClick={this.handleNavbarToggleClick}>
                <span className="sr-only">Toggle navigation</span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
            </button>
        )
    }

    manageChildren () {
        const { children } = this.props

        return React.Children.map(children, (child) => (
            React.cloneElement(child, Object.assign({}, child.props, {
                onMouseUp: () => {
                    console.debug('test')
                    this.handleNavbarToggleClick()
                }
            }))
        ))
    }

    render() {
        const { children, activeKey, className } = this.props
        const { collapsible, hidden } = this.state

        let $nav = null
        if (!collapsible || !hidden) {
            $nav = (
                <Nav bsStyle="tabs" justified activeKey={activeKey} className={className} onClick={this.hideNavbar}>
                    {children}
                </Nav>
            )
        }

        return (
            <div>
                {this.renderNavbarToggle()}
                {$nav}
            </div>
        )
    }
}
