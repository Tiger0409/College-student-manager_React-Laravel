import React, { PropTypes, Component } from 'react'
import { Modal, Button } from 'react-bootstrap'
import { Html } from '../common/FormWidgets.jsx'

export default class ConfirmDialog extends Component {
    render() {
        const {
            headerText,
            confirmText,
            onYes,
            onNo,
            yesText,
            noText,
            rawHTML,
            show,
            height,
            style
        } = this.props

        const sized = style ? style : height ? { height: height, overflowY: 'auto' } : null

        return (
            <Modal show={show} onHide={onNo}>
                <Modal.Dialog>
                    <Modal.Header closeButton>
                        <p>{headerText}</p>
                    </Modal.Header>

                    <Modal.Body style={sized}>
                    {
                        confirmText ?
                            rawHTML ?
                                <Html>{confirmText}</Html>
                                :
                                <p>{confirmText}</p>
                            :
                            <p>Are you sure?</p>
                    }
                    </Modal.Body>

                    <Modal.Footer>
                        <Button onClick={onNo}>{noText ? noText : 'No'}</Button>
                        <Button onClick={onYes} style={{ marginLeft: '15px' }}>{yesText ? yesText : 'Yes'}</Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal>
        )
    }
}

ConfirmDialog.propTypes = {
    headerText: PropTypes.string,
    confirmText: PropTypes.string,
    onYes: PropTypes.func.isRequired,
    onNo: PropTypes.func.isRequired,
    rawHTM: PropTypes.bool,
    yesText: PropTypes.string,
    noText: PropTypes.string,
    height: PropTypes.number,
    show: PropTypes.bool,
    style: PropTypes.object
}