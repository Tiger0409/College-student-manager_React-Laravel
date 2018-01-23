import React, { PropTypes, Component } from 'react'

export default class extends Component {
    componentDidMount() {
        const { method, invoice } = this.props.params

        if (method != 'paypal') return

        /*$.ajax({
            type: 'post',
            url: '/api/cart/submit-items',
            data: { invoice: invoice },
            error(xhr) {
                console.error(xhr)
            }
        })*/
    }

    render() {
        return (
            <div>
                <h2>Payment Success</h2>
                <p>You have completed the payment!</p>
                <p>Classes will be added after a few minutes</p>
            </div>
        )
    }
}