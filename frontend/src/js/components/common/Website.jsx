import React, { Component, PropTypes } from 'react'
import $ from 'jquery'

export class WebsiteComponent extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { html: { __html: '' } }
        this.getHtml = this.getHtml.bind(this)
    }

    render() {
        const { id } = this.props
        const { html } = this.state

        return (
            <div id={id} dangerouslySetInnerHTML={html} />
        )
    }

    loadHtml() {
        const { template } = this.props

        setTimeout(() => this.setState({ html: { __html: template }}), 0)
    }

    getHtml() {
        return { __html: this.state.html }
    }

    componentWillMount() {
        this.loadHtml()
    }

    bindLinksToRouter() {
        const { router } = this.context
        const { id } = this.props

        $(() => {
            $('#' + id + ' a').each((index, elem) => {
                let $elem = $(elem)

                let href = $elem.attr('href')
                if (!href || $elem.attr('href').endsWith('.html')) {
                    return true
                }

                let events = $._data(elem, 'events')
                let clickHandlerExists = events && events.click
                if (!clickHandlerExists) {
                    $elem.click(e => {
                        e.preventDefault()
                        router.push({ pathname: href })
                    })
                }
            })
        })
    }

    componentDidMount() {
        this.bindLinksToRouter()
    }

    componentDidUpdate() {
        this.bindLinksToRouter()
    }
}

WebsiteComponent.contextTypes = {
    router: PropTypes.object.isRequired
}