import React, { PropTypes, Component } from 'react'
import DataLoader from '../../common/DataLoader.jsx'
import { FormField } from '../../common/FormWidgets.jsx'
import S from '../../../utils/StringHelper.js'
import { Link } from 'react-router'
import { Button, Row, Col } from 'react-bootstrap'
import FullDetailsWnd from './FullDetailsWnd.jsx'

const PaypalTransactionDetail = DataLoader(class extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { showFullDetails: false }
    }

    renderValue(label, value) {
        if (!value) {
            return false
        }

        const parts = value.toString().split(' ')
        const notAValue = ['NaN', 'undefined', 'null']
        for (let i = 0; i < parts.length; i++) {
            if (notAValue.includes(parts[i])) {
                return false
            }
        }

        return (
            <FormField width={5} label={label}>
                <p>{value}</p>
            </FormField>
        )
    }

    render() {
        const { data, data: { fullDetails } } = this.props
        const { showFullDetails } = this.state

        return (
            <div>
                <div className='content-block'>
                    <h2 className='block-heading'>Paypal Transaction Detail</h2>
                    <hr />

                    <Row>
                        <Col md={6}>
                            {this.renderValue('Last Update', new Date(data.lastUpdate).toLocaleDateString())}

                            {this.renderValue('Student Name', data.studentName)}

                            {this.renderValue('Total Price', '£ ' + parseFloat(data.totalCalculatedPrice).toFixed(2))}

                            {this.renderValue('Total Price', '£ ' + parseFloat(data.totalDiscount).toFixed(2))}

                            {this.renderValue('Invoice', data.invoiceNo)}

                            {this.renderValue('Invoice Date', data.invoiceDate)}

                            {this.renderValue('Gross Payment From Customer', '£ ' + parseFloat(data.mcGross).toFixed(2) + ' '+ data.mcCurrency)}

                            {this.renderValue('Payment Date in PayPal', fullDetails.paymentDate)}

                            {this.renderValue('Payment Status in PayPal', data.paymentStatus)}
                        </Col>
                        <Col md={6}>
                            {this.renderValue('Payment Type in PayPal', data.paymentType)}

                            {this.renderValue('Verify Sign', fullDetails.verifySign)}

                            {this.renderValue('TXN ID', fullDetails.txnId)}

                            {this.renderValue('Payer Email', fullDetails.payerEmail)}

                            {this.renderValue('Payer ID in PayPal', fullDetails.payerId)}

                            {this.renderValue('Payer Status in PayPal', fullDetails.payerStatus)}

                            {this.renderValue('Receiver Email in PayPal', fullDetails.receiverEmail)}

                            {this.renderValue('Receiver ID in PayPal', fullDetails.receiverId)}
                        </Col>
                    </Row>

                    <Button
                        className='custom'
                        onClick={() => this.setState({ showFullDetails: true})}
                    >
                        Open full variable from PayPal
                    </Button>
                </div>

                <div className='content-block'>
                    <h2 className='block-heading'>Course Registered in this Transaction</h2>
                    <hr />

                    <StudentsRegistered data={data.students} />
                </div>

                <FullDetailsWnd
                    show={showFullDetails}
                    data={fullDetails}
                    onClose={() => this.setState({ showFullDetails: false })}
                />
            </div>
        )
    }
})

export default props =>
    <PaypalTransactionDetail
        ajaxOperations={{
            load: {
                type: 'get',
                url: `/api/transactions/paypal/${props.params.id}`
            }
        }}
        {...props}
    />

const StudentsRegistered = ({ data }) => {
    if (!data) return false

    return (
        <div>
            <table className='table table-striped results-table table-hover'>
                <thead>
                    <tr>
                        <td>Registration Time</td>
                        <td>Course Title</td>
                        <td>Student Status</td>
                        <td>Payment Status</td>
                        <td></td>
                    </tr>
                </thead>

                <tbody>
                {data.map(
                    (student, i) => (
                        <tr key={i}>
                            <td>{new Date(student.registerDate).toLocaleDateString()}</td>
                            <td>{student.course.courseTitle}</td>
                            <td>{student.studentStatus}</td>
                            <td>{student.regPaymentStatus}</td>
                            <td>
                                <Link to={`/students/${student.id}`}>Edit</Link>
                                <span> | </span>
                                <Link to={`/students/${student.id}/grades`}>Grade</Link>
                            </td>
                        </tr>
                    )
                )}
                </tbody>
            </table>
        </div>
    )
}