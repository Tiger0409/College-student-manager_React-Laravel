import React, { PropTypes, Component } from 'react'
import { Button } from 'react-bootstrap'
import Convert from './../../../../utils/Convert.js'

export default class TeacherPayments extends Component {
    constructor(props, context) {
        super(props, context)
        this.add = this.add.bind(this)
        this.deleteRow = this.deleteRow.bind(this)
    }

    change(i, name, value) {
        var { payments, onChange } = this.props
        payments[i][name] = value
        onChange(payments)
    }

    deleteRow(i) {
        var { payments, onChange } = this.props

        if (payments[i].id) {
            payments[i].isDeleted = true
        } else {
            payments.splice(i, 1)
        }

        onChange(payments)
    }

    add() {
        const { payments, onChange } = this.props
        payments.push({
            paidAmount: 0,
            paidBy: '',
            payDate: '',
            payName: '',
            submitted: false,
            workedHours: 0
        })
        onChange(payments)
    }

    getPaymentsCount() {
        const { payments } = this.props
        var count = 0
        if (payments) {
            payments.forEach(payment => {
                if (!payment.isDeleted) {
                    count++
                }
            })
        }
        return count
    }

    renderRows() {
        const { payments, displayNames, editBtn, onEdit } = this.props

        return (
            payments.map((item, i) => {
                if (item.isDeleted) return false

                return (
                    <TeacherPaymentRow
                        editBtn={editBtn}
                        displayName={displayNames}
                        key={i}
                        payment={item}
                        onChange={(name, value) => this.change(i, name, value)}
                        onDelete={() => this.deleteRow(i)}
                        onEdit={onEdit}
                    />
                )
            })
        )
    }

    renderTable() {
        if (this.getPaymentsCount() === 0) {
            return <p>No payments yet</p>
        }

        const { displayNames } = this.props

        return (
            <div className='table-responsive'>
                <table className='table table-striped results-table'>
                    <thead>
                        <tr>
                            {displayNames ? <td>Teacher Name</td> : false}
                            <td>Pay Name</td>
                            <td>Pay Date</td>
                            <td>Paid By</td>
                            <td>Hours Worked</td>
                            <td>Amount Paid</td>
                            <td>Paid</td>
                            <td></td>
                            <td></td>
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderRows()}
                    </tbody>
                </table>
            </div>
        )
    }

    renderLabel() {
        const { label } = this.props
        if (!label) return false
        return <p className='detail-field-label'>{label}</p>
    }

    render() {
        const { onAdd } = this.props

        return (
            <div style={{ marginBottom: '20px' }}>
                {this.renderLabel()}
                {this.renderTable()}
                <Button
                    className='custom btn-success'
                    onClick={() => {onAdd ? onAdd() : this.add()}}
                >
                    Add New Payment
                </Button>
            </div>
        )
    }
}
TeacherPayments.PropTypes = {
    editBtn: PropTypes.bool,
    label: PropTypes.string,
    payments: PropTypes.arrayOf(PropTypes.object).isRequired,
    onChange: PropTypes.func.isRequired,
    onAdd: PropTypes.func,
    onEdit: PropTypes.func
}

class TeacherPaymentRow extends Component {
    constructor(props, context) {
        super(props, context)
        this.change = this.change.bind(this)
        this.deleteRow = this.deleteRow.bind(this)
        this.onEdit = this.onEdit.bind(this)
    }

    change() {
        const { onChange } = this.props

        let name, value

        switch (arguments.length) {
            case 1:
                const e = arguments[0]
                name = e.target.name
                value = e.target.value
                if (e.target.type == 'checkbox') {
                    value = e.target.checked
                }
                break
            case 2:
                name = arguments[0]
                value = arguments[1]
                break
        }

        onChange(name, value)
    }

    onEdit() {
        const { onEdit, payment } = this.props
        if (onEdit) {
            onEdit(payment)
        }
    }

    deleteRow() {
        const { onDelete } = this.props
        onDelete()
    }

    componentDidMount() {
        let self = this

        $(() => {
            $('.datepicker').datepicker({
                dateFormat: 'dd-mm-yy',
                onSelect: function (dateText, inst) {
                    inst.inline = false
                    const parts = dateText.split('-')
                    const value = ([parts[2], parts[1], parts[0]]).join('-')
                    self.change($(this).attr('name'), value)
                }
            })
        })
    }

    render() {
        const { payment, displayName, editBtn } = this.props

        return (
            <tr>
                {displayName ?
                    <td style={{ width: '260px' }}>
                        <input
                            type='text'
                            value={payment.teacherName ? payment.teacherName : ''}
                            className='form-control'
                        />
                    </td>
                    :
                    false
                }

                <td>
                    <input
                        type='text'
                        value={payment.payName}
                        name='payName'
                        className='form-control'
                        onChange={this.change}
                    />
                </td>
                <td>
                    <input
                        value={payment.payDate}
                        name='payDate'
                        className='form-control datepicker'
                        onChange={this.change}
                    />
                </td>
                <td>
                    <input
                        type='text'
                        value={payment.paidBy}
                        name='paidBy'
                        className='form-control'
                        onChange={this.change}
                        />
                </td>
                <td>
                    <input
                        type='text'
                        value={payment.workedHours}
                        name='workedHours'
                        className='form-control'
                        onChange={this.change}
                        />
                </td>
                <td>
                    <input
                        type='text'
                        value={payment.paidAmount}
                        name='paidAmount'
                        className='form-control'
                        onChange={this.change}
                        />
                </td>
                <td style={{ verticalAlign: 'middle' }}>
                    <input
                        type='checkbox'
                        checked={Convert.toBool(payment.submitted)}
                        name='submitted'
                        onChange={this.change}
                    />
                </td>

                {editBtn ?
                    <td>
                        <Button onClick={this.onEdit}>Edit</Button>
                    </td>
                    :
                    <td>
                        &nbsp;
                    </td>
                }

                <td>
                    <Button bsStyle='danger' onClick={this.deleteRow}>Delete</Button>
                </td>
            </tr>
        )
    }
}
TeacherPaymentRow.PropTypes = {
    payment: PropTypes.shape({
        id: PropTypes.number,
        paidAmount: PropTypes.number,
        paidBy: PropTypes.string,
        payDate: PropTypes.string,
        payName: PropTypes.string,
        submitted: PropTypes.bool,
        workedHours: PropTypes.number
    }),
    onChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
}