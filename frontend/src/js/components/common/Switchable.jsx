import React, { PropTypes, Component } from 'react'
import ReactDOM from 'react-dom'

export default (ActiveComponent, PassiveComponent) => class extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { isActive: false }
        this.onClick = this.onClick.bind(this)
    }

    onClick(e) {
        const isOutsideClick = !ReactDOM.findDOMNode(this).contains(e.target)

        this.setState({ isActive: !isOutsideClick })
    }

    componentWillMount() {
        document.addEventListener('click', this.onClick, false);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.onClick, false);
    }

    render() {
        const { isActive } = this.state
        const { activeProps, passiveProps } = this.props

        return isActive ?
            <ActiveComponent {...activeProps} /> :
            <PassiveComponent {...passiveProps} />
    }
}