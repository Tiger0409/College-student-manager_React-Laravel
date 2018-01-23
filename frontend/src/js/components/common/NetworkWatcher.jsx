import React, { PropTypes, Component } from 'react'

export default class NetworkWatcher extends Component {
    constructor(props, context) {
        super(props, context)
        this.attempts = 4
        this.checkDelay = 10000
        this.styles = {
            background: {
                width: '100%',
                height: '100%',
                position: 'fixed',
                top: '0',
                left: '0',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: '9'
            },
            notifyBox: {
                height: '60px',
                backgroundColor: 'rgba(229, 92, 92, 0.78)',
                position: 'fixed',
                top: '50%',
                left: '50%',
                marginRight: '-50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                borderRadius: '10px',
                padding: '0px 40px 0px 40px',
                zIndex: '10'
            },
            message: {
                margin: '0',
                lineHeight: '60px'
            },
            img: {
                width: '25px',
                height: '25px',
                alignSelf: 'center',
                marginRight: '10px'
            }
        }

        this.state = { attemptsMade: 0, isOnline: true }
        this.check = this.check.bind(this)
        this.fadeIn = this.fadeIn.bind(this)
        this.fadeOut = this.fadeOut.bind(this)
    }

    fadeOut() {
        $('#noNetBackground').fadeOut('slow')
    }

    fadeIn() {
        $('#noNetBackground').fadeIn('slow')
    }

    check() {
        $.ajax({
            type: 'get',
            url: '/api/test/connection',
            success: () => {
                this.setState({ isOnline: true, attemptsMade: 0 })
                this.fadeOut()
                setTimeout(this.check, this.checkDelay)
            },
            error: () => {
                let { attemptsMade } = this.state
                attemptsMade++
                if (attemptsMade == this.attempts) {
                    this.setState({ isOnline: false })
                    this.fadeIn()
                }

                this.setState({ attemptsMade: attemptsMade })
                setTimeout(this.check, this.checkDelay)
            }
        })
    }

    componentDidMount() {
        // check will run itself at end
        setTimeout(this.check, this.checkDelay)
    }

    render() {
        return (
            <div style={Object.assign({ display: 'none' }, this.styles.background)} id='noNetBackground'>
                <div style={this.styles.notifyBox}>
                    <img style={this.styles.img} src='/src/images/cross.gif' />
                    <h2 style={this.styles.message}>No internet Connection</h2>
                </div>
            </div>
        )
    }
}