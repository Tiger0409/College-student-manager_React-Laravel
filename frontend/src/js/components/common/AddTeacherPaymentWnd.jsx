import React, { PropTypes, Component } from 'react'
import { Modal, Button } from 'react-bootstrap'
import { FormField } from '../common/FormWidgets.jsx'
import Dh from '../../utils/DateHelper.js'
import DataLoader from '../common/DataLoader.jsx'
import Notifier from '../../utils/Notifier.js'

class AddTeacherPaymentWnd extends Component {
    constructor(props, context) {
        super(props, context)
        this.defaultState = {
            id: null,
            teacherId: -1,
            payName: '',
            payDate: Dh.extractValues(new Date()).toString('-'),
            paidAmount: 0,
            workedHours: 0,
            paidBy: '',
            submitted: false
        }
        this.state = this.defaultState
        this.close = this.close.bind(this)
        this.add = this.add.bind(this)
        this.update = this.update.bind(this)
        this.onChange = this.onChange.bind(this)
    }
    
    onChange(e) {
        const { name, value, type, checked } = e.target

        if (type == 'checkbox') {
            this.setState({ [name]: checked })
            return
        }

        this.setState({ [name]: value })
    }
    
    close() {
        this.setState(this.defaultState)
        const { onClose } = this.props
        onClose()
    }

    getInput() {
        const { teacherId, payName, payDate, paidAmount, workedHours, paidBy, submitted } = this.state

        return {
            teacherId: teacherId,
            payName: payName,
            payDate: payDate,
            paidAmount: paidAmount,
            workedHours: workedHours,
            paidBy: paidBy,
            submitted: submitted
        }
    }
    
    add() {
        const { save, onAdd } = this.props

        save({ data: this.getInput() },
            payment => { onAdd(payment), this.close() }
        )
    }

    update() {
        const { onUpdate } = this.props
        const { id } = this.state

        if (!id) return

        $.ajax({
            type: 'put',
            url: `/api/teacher-payments/${id}`,
            data: this.getInput(),
            success: updatedPayment => {
                Notifier.success('Updated')
                updatedPayment.id = id
                onUpdate(updatedPayment)
                this.close()
            },
            error: xhr => {
                Notifier.error('Update failed')
            }
        })
    }

    loadPayment(props) {
        const { payment } = props

        if (payment) {
            console.log('loading payment', payment)
            this.setState(payment)
        } else {
            this.setState(this.defaultState)
        }
    }

    componentWillMount() {
        this.loadPayment(this.props)
    }

    componentWillReceiveProps(newProps, newContext) {
        this.loadPayment(newProps)
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
                    const name = $(this).attr('name')
                    self.setState({ [name]: value })
                }
            })
        })
    }
    
    render() {
        const { show, teachers } = this.props
        const { id, teacherId, payName, payDate, paidAmount, workedHours, paidBy, submitted } = this.state

        return (
            <Modal show={show} onHide={this.close}>
                <Modal.Dialog>
                    <Modal.Header closeButton>
                        <p style={{ textAlign: 'center', fontSize: '14pt' }}>
                            Add teacher payment
                        </p>
                    </Modal.Header>

                    <Modal.Body>
                        <FormField width={8} offset={2} label='Teacher'>
                            <select
                                onChange={this.onChange}
                                name='teacherId'
                                className='form-control'
                                value={teacherId}
                            >
                                <option value='-1'>-</option>
                                {
                                    teachers.map((teacher, i) => (
                                        <option key={i} value={teacher.id}>{teacher.userFullname}</option>
                                    ))
                                }
                            </select>
                        </FormField>

                        <FormField width={8} offset={2} label='Pay name'>
                            <input
                                name='payName'
                                type='text'
                                className='form-control'
                                value={payName}
                                onChange={this.onChange}
                            />
                        </FormField>

                        <FormField width={8} offset={2} label='Paid by'>
                            <input
                                name='paidBy'
                                type='text'
                                className='form-control'
                                value={paidBy}
                                onChange={this.onChange}
                            />
                        </FormField>

                        <FormField width={8} offset={2} label='Pay date'>
                            <input
                                name='payDate'
                                className='form-control datepicker'
                                value={payDate}
                                onChange={this.onChange}
                            />
                        </FormField>

                        <FormField width={8} offset={2} label='Hours'>
                            <input
                                name='workedHours'
                                type='text'
                                className='form-control'
                                value={workedHours}
                                onChange={this.onChange}
                            />
                        </FormField>

                        <FormField width={8} offset={2} label='Amount Paid'>
                            <input
                                name='paidAmount'
                                type='text'
                                className='form-control'
                                value={paidAmount}
                                onChange={this.onChange}
                            />
                        </FormField>

                        <FormField width={8} offset={2} label='Submitted'>
                            <input
                                style={{ marginLeft: '10px' }}
                                name='submitted'
                                type='checkbox'
                                checked={submitted}
                                onChange={this.onChange}
                            />
                        </FormField>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button onClick={this.close}>Cancel</Button>
                        {id ?
                            <Button onClick={this.update} style={{ marginLeft: '15px' }}>Save</Button>
                            :
                            <Button onClick={this.add} style={{ marginLeft: '15px' }}>Add</Button>
                        }

                    </Modal.Footer>
                </Modal.Dialog>
            </Modal>
        )
    }
}

AddTeacherPaymentWnd.propTypes = {
    payment: PropTypes.object,
    teachers: PropTypes.array,
    onAdd: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    show: PropTypes.bool
}

export default DataLoader(AddTeacherPaymentWnd, {
    save: { type: 'post', url: '/api/teacher-payments' }
})