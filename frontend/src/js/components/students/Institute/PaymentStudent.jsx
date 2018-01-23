import React, { PropTypes, Component } from 'react'
import PaymentForm from '../../common/PaymentForm.jsx'
import PromiseHelper from '../../../utils/PromiseHelper.js'

export default class PaymentStudent extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            payment: 0,
            courseClassId :null
        }
    }
    load(props){
        this.setState({
            payment : props.amount,
            courseClassId : props.id
        })
    }
    componentWillMount() {
        this.load(this.props.params)
        localStorage.removeItem('pay-'+this.props.params.id)
    }
    render(){
        const {payment , courseClassId} = this.state
        return(
            <div>
                <div style={{ width: '580px', marginLeft: 'auto', marginRight: 'auto', padding: '30px' }}>
                    <p>Total : £ {payment}</p>
                </div>
                <PaymentForm url={`/api/student-payment-checkout/${payment}/${courseClassId}`}checkAvailableMethods />
            </div>
        )
    }
}