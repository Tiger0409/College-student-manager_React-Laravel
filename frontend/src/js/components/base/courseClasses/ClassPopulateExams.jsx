import React, { Component, PropTypes } from 'react'
import SourceSelect from './../../common/SourceSelect.jsx'
import { Button } from 'react-bootstrap'
import { FormField } from './../../common/FormWidgets.jsx'
import Notifier from '../../../utils/Notifier.js'

export default class ClassPopulateExams extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {feedbackCode: 1, overwrite: false}
    }

    render() {
        const { feedbackCode, overwrite } = this.state

        return (
            <div>
                <h4>Populate Exams</h4>
                <FormField width={5} label='Level'>
                    <SourceSelect
                        name='feedbackLevel'
                        id='feedBackLevel'
                        url='/api/lookup/get-feedback-level'
                        className='form-control'
                        value={feedbackCode}
                        onChange={e => this.setState({feedbackCode: e.target.value})}/>
                </FormField>
                <FormField width={5} label='Overwrite'>
                    <input
                        style={{display: 'block'}}
                        type='checkbox'
                        name='overwrite'
                        id='overwrite'
                        checked={overwrite}
                        onChange={e => this.setState({overwrite: e.target.checked})}/>
                </FormField>
                <Button onClick={e => this.populate()}>Populate</Button>
            </div>
        )
    }

    populate() {
        const { classId } = this.props
        const { feedbackCode, overwrite } = this.state
        $.ajax({
            type: 'post',
            url: '/api/exams/populate',
            data: {classId: classId, feedbackCode: feedbackCode, overwrite: overwrite},
            success: response => {
                Notifier.success('Populated')
                console.log(response)
            },
            error: xhr => {
                Notifier.error('Failed')
                console.log(xhr)
            }
        })
    }
}
ClassPopulateExams.PropTypes = {
    classId: PropTypes.number
}