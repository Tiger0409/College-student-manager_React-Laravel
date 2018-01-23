import React, { PropTypes, Component } from 'react'
import { Button } from 'react-bootstrap'

let styles = {
    input: { width: '300px', display: 'inline-block', marginBottom: 10 },
    button: { marginLeft: '15px', verticalAlign: 'top', marginBottom: 10 }
}

if (window.innerWidth < 768) {
    styles = {
        input: { width: '100%', marginBottom: 10 },
        button: { width: '100%', marginBottom: 10 },
    }
}

export default class TxnFilter extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {txnId: ''}
        this.submit = this.submit.bind(this)
    }

    render() {
        return (
            <div>
                <form id='filterForm' onSubmit={this.submit} style={{ marginTop: '35px' }}>
                    <p className='detail-field-label'>TXN ID</p>

                    <input
                        className='form-control'
                        type='text'
                        id='txnId'
                        name='txnId'
                        value={this.state.txnId}
                        onChange={e => this.setState({ txnId: e.target.value })}
                        style={styles.input}
                    />

                    <Button
                        style={styles.button}
                        className='custom btn-success'
                        type='submit'
                    >
                        Filter
                    </Button>
                </form>
            </div>
        )
    }

    submit(e) {
        e.preventDefault()
        if (this.props.onSubmit)
            this.props.onSubmit(this.state.txnId)
    }
}

