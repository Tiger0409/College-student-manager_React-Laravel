import React, { PropTypes, Component } from 'react'
import { Modal, Button, Row, Col } from 'react-bootstrap'
import { FormField } from '../common/FormWidgets.jsx'
import DataLoader from '../common/DataLoader.jsx'
import Notifier from '../../utils/Notifier.js'
import O from '../../utils/ObjHelper.js'

let styles = {
    formLabel: {
        textAlign: 'right'
    }
}

if (window.innerWidth < 1025) {
    styles = {
        formLabel: {
            textAlign: 'left'
        }
    }   
}

class QuickRegisterWindow extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            classId: null,
            classFees: { feeForEmployed: -1, feeForUnemployed: -1 },
            studentStatus: null
        }
        this.onChange = this.onChange.bind(this)
        this.onRegister = this.onRegister.bind(this)
        this.close = this.close.bind(this)
    }

    close() {
        const { onClose } = this.props
        this.setState({ classId: null, studentStatus: null })
        onClose()
    }

    onRegister() {
        const { router, user } = this.context
        const { execute } = this.props
        const { classId, studentStatus } = this.state
        console.log(studentStatus)
        console.log(execute)
        if (classId == null) {
            Notifier.error('Class time as not selected')
            return
        }

        if (studentStatus == null) {
            Notifier.error('Employment was not selected')
            return
        }

        if (!user) {
            let registeredClasses = localStorage.getItem('registeredClasses')
            if (registeredClasses == null) {
                registeredClasses = []
            } else {
                registeredClasses = JSON.parse(registeredClasses)
            }

            registeredClasses.push({ classId: classId, studentStatus: studentStatus })

            localStorage.setItem('registeredClasses', JSON.stringify(registeredClasses))

            router.push('/login')

            return
        }

        execute('addClassToCart', { classId: classId, studentStatus: studentStatus },
            () => {
                Notifier.success('Class added to cart')
                this.close()
                router.push('/cart')
            },
            xhr => {
                Notifier.error(xhr.responseText.replace(/"/g, ''))
                console.error(xhr)
                this.close()
            }
        )
    }

    onChange(e) {
        this.setState({ [e.target.name]: e.target.value })
    }

    render() {
        const { course, gender, course: { genderSplit } } = this.props
        const { classId, classFees, studentStatus } = this.state
        const { [gender]: {classes} } = genderSplit
        const { website } = this.context

        return (
            <div className='static-modal modal-container'>
                <Modal.Dialog>
                    <Modal.Header>
                        Register online
                    </Modal.Header>

                    <Modal.Body>

                        <Row style={{ marginBottom: '20px' }}>
                            <Col mdOffset={2} md={3} style={styles.formLabel}>
                                <span style={{ lineHeight: '35px' }}>Course</span>
                            </Col>
                            <Col md={6}>
                                <span style={{ lineHeight: '35px' }}>{course.courseTitle}</span>
                             </Col>
                        </Row>

                        <Row style={{ marginBottom: '20px' }}>
                            <Col mdOffset={2} md={3} style={styles.formLabel}>
                                <span style={{ lineHeight: '35px' }}>Class time</span>
                            </Col>
                            <Col md={6}>
                                <select
                                    name='classId'
                                    value={classId}
                                    onChange={e => {
                                        const id = e.target.value
                                        let fees = {}
                                        for (let i = 0; i < classes.length; i++) {
                                            if (classes[i].id == id) {
                                                fees.feeForEmployed = classes[i].feeForEmployed
                                                fees.feeForUnemployed = classes[i].feeForUnemployed
                                                break
                                            }
                                        }

                                        this.setState({ classId: id, classFees: fees })
                                    }}
                                    className='form-control'
                                >
                                    <option value="-1">{'Choose Day & Time'}</option>
                                    {classes.map(
                                        (classObj, i) => (
                                            <option
                                                key={i}
                                                value={classObj.id}
                                            >
                                                {classObj.classTime}
                                            </option>
                                        )
                                    )}
                                </select>
                            </Col>
                        </Row>

                        <Row style={{ marginBottom: '20px' }}>
                            <Col mdOffset={2} md={3} style={styles.formLabel}>
                                <span style={{ lineHeight: '35px' }}>Fee</span>
                            </Col>

                            <Col md={6}>
                                <select
                                    name='studentStatus'
                                    value={studentStatus}
                                    onChange={this.onChange}
                                    className='form-control'
                                >
                                    <option value="0">
                                        {O.getIfExists(website, 'paymentHeading', 'Choose Fees')}
                                    </option>

                                    <option value='employed'>
                                        {O.getIfExists(website, 'paymentField1', 'employed')} £{classFees.feeForEmployed >= 0 ? classFees.feeForEmployed : course.feeForEmployed}
                                    </option>

                                    {course.isEarlyBirdOn == 'yes' &&
                                        <option value='unemployed'>
                                            {O.getIfExists(website, 'paymentField2', 'unemployed')} £{classFees.feeForUnemployed >= 0 ? classFees.feeForUnemployed : course.feeForUnemployed}
                                        </option>
                                    }
                                </select>
                            </Col>
                        </Row>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button
                            onClick={this.onRegister}
                            style={{ marginRight: '15px' }}
                            bsStyle='primary'
                        >
                            Register
                        </Button>

                        <Button onClick={this.close}>Cancel</Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </div>
        )
    }
}

QuickRegisterWindow.propTypes = {
    course: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired
}

QuickRegisterWindow.contextTypes = {
    user: PropTypes.object,
    router: PropTypes.object.isRequired,
    website: PropTypes.object.isRequired
}

export default DataLoader(QuickRegisterWindow, {
    addClassToCart: { type: 'post', url: '/api/cart/add' }
})
