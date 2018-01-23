import React, { PropTypes, Component } from 'react'
import { Modal, Button } from 'react-bootstrap'
import { FormField } from '../../common/FormWidgets.jsx'
import DataLoader from '../../common/DataLoader.jsx'

class QuickAddClassWnd extends Component {
    constructor(props, context) {
        super(props, context)
        this.initialState = {
            classTime: '',
            classGender: 'male',
            classWeight: 0,
            feeForEmployed: props.feeForEmployed,
            feeForUnemployed: props.feeForUnemployed
        }
        this.state = this.initialState
        this.close = this.close.bind(this)
        this.add = this.add.bind(this)
        this.onChange = this.onChange.bind(this)
    }

    clear() {
        for (const prop in this.state) {
            let value = null
            if (typeof this.initialState[prop] !== 'undefined') {
                value = this.initialState[prop]
            }

            this.setState({ [prop]: value })
        }
    }

    close() {
        this.clear()
        this.props.onClose()
    }

    add() {
        const { classTime, classGender} = this.state
        let { classWeight, feeForEmployed, feeForUnemployed } = this.state

        if (classWeight.length === 0) classWeight = 0
        const { save, courseId, onAdd } = this.props
        save({
                courseId: courseId,
                classGender: classGender,
                classTime: classTime,
                classWeight: classWeight,
                feeForEmployed: feeForEmployed,
                feeForUnemployed: feeForUnemployed,
            },
            newClass => {
                onAdd(newClass)
                this.close()
            },
            xhr => console.error(xhr)
        )
    }

    onChange(e) {
        const { name, value } = e.target
        this.setState({ [name]: value })
    }

    render() {
        const { show, courseTitle } = this.props
        const { classTime, classGender, classWeight, feeForEmployed, feeForUnemployed } = this.state

        return (
            <Modal show={show}>
                <Modal.Header>
                    Add class {courseTitle ? `to ${courseTitle}` : ''}
                </Modal.Header>

                <Modal.Body>
                    <FormField label='Class time' width={12}>
                        <input
                            type='text'
                            className='form-control'
                            name='classTime'
                            onChange={this.onChange}
                            value={classTime}
                        />
                    </FormField>

                    <FormField label='Class gender' width={12}>
                        <select
                            name='classGender'
                            className='form-control'
                            value={classGender}
                            onChange={this.onChange}
                        >
                            <option value='male'>Male</option>
                            <option value='female'>Female</option>
                            <option value='both'>Both</option>
                        </select>
                    </FormField>

                    <p>Optional</p>

                    <FormField label='Class weight' width={12}>
                        <input
                            type='text'
                            className='form-control'
                            name='classWeight'
                            onChange={this.onChange}
                            value={classWeight}
                        />
                    </FormField>

                    <FormField label='Fee for employed' width={12}>
                        <input
                            type='text'
                            className='form-control'
                            name='feeForEmployed'
                            onChange={this.onChange}
                            value={feeForEmployed}
                        />
                    </FormField>

                    <FormField label='Fee for unemployed' width={12}>
                        <input
                            type='text'
                            className='form-control'
                            name='feeForUnemployed'
                            onChange={this.onChange}
                            value={feeForUnemployed}
                        />
                    </FormField>
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        bsStyle='success'
                        style={{ marginRight: '15px' }}
                        onClick={this.add}
                    >
                        Add
                    </Button>

                    <Button onClick={this.close}>Cancel</Button>
                </Modal.Footer>
            </Modal>
        )
    }
}

QuickAddClassWnd.propTypes = {
    show: PropTypes.bool,
    courseTitle: PropTypes.string,
    courseId: PropTypes.number.isRequired,
    onClose: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    feeForEmployed: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    feeForUnemployed: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}

export default DataLoader(QuickAddClassWnd, {
    save: { type: 'post', url: '/api/classes' }
})