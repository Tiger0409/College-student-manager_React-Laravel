import React, { PropTypes, Component } from 'react'
import DataLoader from '../../common/DataLoader.jsx'
import { FormField } from '../../common/FormWidgets.jsx'
import S from '../../../utils/StringHelper.js'
import O from '../../../utils/ObjHelper.js'
import { Link } from 'react-router'
import { Button, Row, Col } from 'react-bootstrap'
import FullDetailsWnd from './FullDetailsWnd.jsx'

const get = O.getIfExists

const StripeTransactionDetail = DataLoader(class extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { showFullDetails: false }

        let data = props.data
        data.created = new Date(data.created).toLocaleDateString()
        if (data.fullDetails.created && typeof data.fullDetails.created === 'object') {
            data.fullDetails.created = data.created
        }
        this.state.data = data
    }

    renderValue(label, value, link) {

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
                {link ?
                    <a style={{ cursor: 'pointer', display: 'block' }} href={link}>{value}</a> :
                    <p>{value}</p>
                }
            </FormField>
        )
    }

    render() {
        const { data, data: { fullDetails }, data: { cart } } = this.props
        const { showFullDetails } = this.state
        const students = cart ? cart.students : null

        return (
            <div>
                <div className='content-block'>
                    <h2 className='block-heading'>Paypal Transaction Detail</h2>
                    <hr />

                    <Row>
                        <Col md={6}>
                            {this.renderValue('Last Update', data.created)}

                            {this.renderValue('Status', data.status)}

                            {this.renderValue('Student Name', get(data, 'user.userFullname', ''), `/users/${get(data, 'user.id', '')}`)}

                            {this.renderValue('Total Amount', `${data.currency} ${parseFloat(data.amount).toFixed(2)}`)}
                        </Col>

                        <Col md={6}>
                            {this.renderValue('Customer', data.customer)}

                            {this.renderValue('Description', data.description)}

                            {this.renderValue('TXN ID', data.balanceTransaction)}

                            {this.renderValue('Card Owner Name', data.cardOwnerName)}
                        </Col>
                    </Row>

                    <Button
                        className='custom'
                        onClick={() => this.setState({ showFullDetails: true})}
                    >
                        Open full variable from Stripe
                    </Button>
                </div>

                {true ? false : <div className='content-block'>
                    <h2 className='block-heading'>Course Registered in this Transaction</h2>
                    <hr />

                    <StudentsRegistered data={students} />
                </div>}

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
    <StripeTransactionDetail
        ajaxOperations={{
            load: {
                type: 'get',
                url: `/api/transactions/stripe/${props.params.id}`,
                data: {
                    fields: [
                        'user.userFullname',
                        'user.id',
                        'amount',
                        'balanceTransaction',
                        'currency',
                        'customer',
                        'description',
                        'created',
                        'fullDetails',
                        'status',
                        'cardOwnerName',
                        'cart.students'
                    ]
                }
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