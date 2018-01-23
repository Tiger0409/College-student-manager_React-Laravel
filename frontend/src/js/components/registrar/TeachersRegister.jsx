import React, { Component, PropTypes } from 'react'
import TeachersPayments from '../base/users/teachers/TeacherPayments.jsx'
import DataLoader from '../common/DataLoader.jsx'
import { Tabs, Tab, Row, Col } from 'react-bootstrap'
import { FormField } from '../common/FormWidgets.jsx'
import Dh from '../../utils/DateHelper.js'
import AddTeacherPaymentWnd from '../common/AddTeacherPaymentWnd.jsx'
import Notifier from '../../utils/Notifier.js'
import RoleFilter from '../common/RoleFilter.jsx'
import { ROLES } from '../../config/constants.js'

class TeachersRegister extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            teacherId: -1,
            paymentDate: Dh.extractValues(new Date()).toString('-'),
            teacherGender: 'all',
            selectedTabKey: 0,
            useDateFilter: false,
            showEditPayment: false,
            teachers: props.data.rows
        }
        this.deletePayment = this.deletePayment.bind(this)
        this.onChange = this.onChange.bind(this)
        this.onPaymentsChange = this.onPaymentsChange.bind(this)
        this.onPaymentAdd = this.onPaymentAdd.bind(this)
        this.onPaymentUpdate = this.onPaymentUpdate.bind(this)
    }

    onChange({ target: { type, name, value, checked } }) {
        if (type == 'checkbox') {
            this.setState({ [name]: checked })
            return
        }

        this.setState({ [name]: value })
    }

    onPaymentAdd(payment) {
        let { teachers } = this.state
        for (let i = 0; i < teachers.length; i++) {
            if (teachers[i].id == payment.teacherId) {
                teachers[i].teacherPayments.push(payment)
                break
            }
        }
    }

    onPaymentUpdate(updatedPayment) {
        this.deletePayment(updatedPayment)
        this.onPaymentAdd(updatedPayment)
    }

    deletePayment(payment) {
        let { teachers } = this.state


        for (let i = 0; i < teachers.length; i++) {
            if (!teachers[i].teacherPayments) continue

            let paymentFound = false

            for (let j = 0; j < teachers[i].teacherPayments.length; j++) {
                if (teachers[i].teacherPayments[j].id == payment.id) {
                    teachers[i].teacherPayments.splice(j, 1)
                    paymentFound = true
                    break
                }
            }

            if (paymentFound) break
        }

        this.setState({ teachers: teachers })
    }

    onPaymentsChange(changedPayments) {
        if (!changedPayments) return

        const { execute } = this.props
        const { teachers } = this.state

        let idsToDelete = []
        changedPayments.forEach(changedPayment => {
            if (changedPayment.isDeleted) {
                this.deletePayment(changedPayment)

                idsToDelete.push(changedPayment.id)
            }
        })

        if (idsToDelete.length > 0) {
            execute('deletePayments', { ids: idsToDelete },
                () => Notifier.success('Deleted successfully'),
                xhr => Notifier.error('Deletion failed')
            )
        }
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

    renderFilters() {
        const { teachers, teacherId, teacherGender, paymentDate, useDateFilter } = this.state

        return (
            <Row style={{ marginTop: '30px', marginBottom: '30px' }}>
                <FormField width={4}>
                    <select
                        className='form-control'
                        name='teacherId'
                        onChange={this.onChange}
                        value={teacherId}
                    >
                        <option value="-1">All teachers</option>
                    {
                        teachers.map(
                            (teacher, i) => (
                                <option value={teacher.id} key={i}>{teacher.userFullname}</option>
                            )
                        )
                    }
                    </select>
                </FormField>

                {
                    teacherId == -1 ?
                        <FormField width={4}>
                            <select
                                className='form-control'
                                name='teacherGender'
                                onChange={this.onChange}
                                value={teacherGender}
                            >
                                <option value='all'>All genders</option>
                                <option value='male'>Male</option>
                                <option value='female'>Female</option>
                            </select>
                        </FormField>
                        :
                        <div></div>
                }

                <Col md={4} style={{ marginBottom: 15 }}>
                    <input
                        className='form-control datepicker'
                        name='paymentDate'
                        value={paymentDate}
                        onChange={this.onChange}
                    />
                </Col>

                <Col md={2} mdOffset={10} style={{ marginTop: '7px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 15 }}>
                        <input
                            name='useDateFilter'
                            type='checkbox'
                            checked={useDateFilter}
                            onChange={this.onChange}
                            style={{ alignSelf: 'center', marginTop: '0' }}
                        />

                        <span style={{ marginLeft: '5px', alignSelf: 'center' }}>Use date filter</span>
                    </div>
                </Col>
            </Row>
        )
    }

    renderPayments() {
        const { teacherId, teacherGender, paymentDate, useDateFilter, teachers } = this.state
        let payments = {
            data: [],
            push: function (teacherName, newPayments) {
                if (!newPayments) return

                newPayments.forEach((payment, i) => {
                    if (!useDateFilter || payment.payDate == paymentDate) {
                        payment.teacherName = teacherName
                        this.data.push(payment)
                    }
                })
            }
        }

        for (let i = 0; i < teachers.length; i++) {
            if (teacherId != -1) {
                if (teachers[i].id == teacherId) {
                    payments.push(teachers[i].userFullname, teachers[i].teacherPayments)
                    break
                }
            } else {
                if (teacherGender == teachers[i].profile.profileGender || teacherGender == 'all') {
                    payments.push(teachers[i].userFullname, teachers[i].teacherPayments)
                }
            }
        }

        return (
            <div style={{ marginTop: '15px' }}>
                <TeachersPayments
                    editBtn
                    displayNames
                    payments={payments.data}
                    onAdd={() => this.setState({ selectedPayment: null, showEditPayment: true })}
                    onChange={this.onPaymentsChange}
                    onEdit={payment => this.setState({ selectedPayment: payment, showEditPayment: true })}
                />
            </div>
        )
    }

    render() {
        const { selectedTabKey, showEditPayment, teachers, selectedPayment } = this.state
        
        return (
            <div>
                <div className='content-block'>
                    <h2 className='block-heading'>Filter</h2>
                    <hr />

                    {this.renderFilters()}
                </div>


                <div className='content-block'>
                    <h2 className='block-heading'>Payments</h2>
                    <hr />

                    {this.renderPayments()}

                    <AddTeacherPaymentWnd
                        payment={selectedPayment}
                        teachers={teachers}
                        show={showEditPayment}
                        onAdd={this.onPaymentAdd}
                        onUpdate={this.onPaymentUpdate}
                        onClose={() => this.setState({ showEditPayment: false })}
                    />
                </div>
            </div>
        )
    }
}

export default RoleFilter(
    DataLoader(TeachersRegister, {
        load: {
            type: 'get',
            url: '/api/users/teachers',
            data: { fields: ['id', 'profile.profileGender', 'teacherPayments', 'userFullname'] }
        },
        deletePayments: {
            type: 'delete',
            url: '/api/teacher-payments'
        }
    }),
    [ROLES.ADMIN, ROLES.SUPER_ADMIN]
)