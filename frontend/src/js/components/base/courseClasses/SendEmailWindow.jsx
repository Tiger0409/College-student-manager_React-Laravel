import React, { PropTypes, Component } from 'react'
import { Modal, Button } from 'react-bootstrap'
import DataLoader from '../../common/DataLoader.jsx'
import { FormField } from '../../common/FormWidgets.jsx'
import Notifier from '../../../utils/Notifier.js'
import autosize from '../../../libs/autosize.js'

class SendEmailWindow extends Component {
    constructor(props, context) {
        super(props, context)
        this.regStatuses = props.data
        this.state = { }
        this.close = this.close.bind(this)
        this.save = this.save.bind(this)
        this.onMessageContentChange = this.onMessageContentChange.bind(this)
        this.onChange = this.onChange.bind(this)
    }

    changeState(stateProp, value) {
        this.setState({ [stateProp]: value })
    }

    clearState() {
        for (let prop in this.state) {
            this.setState({ [prop]: '' })
        }
    }

    onChange(e) {
        this.changeState(e.target.name, e.target.value)
    }

    onMessageContentChange(messageContent) {
        this.setState({ messageContent })
    }

    close() {
        this.clearState()
        this.props.onClose()
    }

    save() {
        const { execute } = this.props
        const data = this.state

        execute('sendEmails', data,
            () => {
                Notifier.success('All emails was sent')
                this.close()
            },
            () => {
                Notifier.error('Error sending emails')
                this.close()
            }
        )
    }

    componentDidMount() {
        $(() => {
            autosize($('textarea'))
        })
    }

    render() {
        const { messageContent, subject } = this.state

        return (
            <div className='static-modal modal-container'>
                <Modal.Dialog>
                    <Modal.Header>
                        <Modal.Title>Send email to all students</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <FormField width={12} label='Subject'>
                            <input
                                type='text'
                                name='subject'
                                className='form-control'
                                value={subject}
                                onChange={this.onChange}
                            />
                        </FormField>

                        <FormField width={12} label='Message content'>
                            <textarea
                                name='messageContent'
                                rows='4'
                                className='form-control'
                                style={{ resize: 'vertical', maxHeight: '500px' }}
                                value={messageContent}
                                onChange={this.onChange}
                            ></textarea>
                        </FormField>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button onClick={this.close}>Cancel</Button>
                        <Button onClick={this.save} bsStyle='success'>Save</Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </div>
        )
    }
}

const SendEmailWindowWrapper = DataLoader(SendEmailWindow)

export default props => (
    <SendEmailWindowWrapper
        {...props}
        ajaxOperations={{
            sendEmails: { type: 'post', url: `/api/classes/${props.classId}/send-email` }
        }}
    />
)