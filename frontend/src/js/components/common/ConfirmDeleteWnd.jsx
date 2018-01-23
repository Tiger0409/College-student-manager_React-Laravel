import React, { PropTypes, Component } from 'react'
import { Modal, Button } from 'react-bootstrap'
import { FormField } from '../common/FormWidgets.jsx'
import autosize from '../../libs/autosize.js'

export default class ConfirmDeleteWnd extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { reason: '' }
        this.close = this.close.bind(this)
        this.confirm = this.confirm.bind(this)
        this.onChange = this.onChange.bind(this)
    }
    
    onChange(e) {
        const { name, value } = e.target
        this.setState({ [name]: value })
    }
    
    close() {
        const { onClose } = this.props
        this.setState({ reason: '' })
        onClose()
    }
    
    confirm() {
        const { onConfirm } = this.props
        onConfirm(this.state.reason)
        this.close()
    }

    componentDidMount() {
        $(() => autosize($('textarea')))
    }
    
    render() {
        const {
            headerText,
            show,
            noReason
        } = this.props
        
        const { reason } = this.state

        return (
            <Modal show={show} onHide={this.close}>
                <Modal.Dialog>
                    <Modal.Header closeButton>
                        <p style={{ textAlign: 'center', fontSize: '14pt' }}>
                            {headerText ? headerText : 'Are you sure?'}
                        </p>
                    </Modal.Header>

                    <Modal.Body style={noReason ? { display: 'none' } : {}}>
                        <FormField label="Reason" width={12}>
                            <textarea
                                className="form-control"
                                rows="2"
                                name="reason"
                                onChange={this.onChange}
                                value={reason}
                            ></textarea>
                        </FormField>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button onClick={this.close}>No</Button>
                        <Button onClick={this.confirm} style={{ marginLeft: '15px' }}>Yes</Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal>
        )
    }
}

ConfirmDeleteWnd.propTypes = {
    headerText: PropTypes.string,
    onConfirm: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    show: PropTypes.bool
}