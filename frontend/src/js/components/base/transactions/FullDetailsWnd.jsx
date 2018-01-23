import React, { PropTypes, Component } from 'react'
import { Modal, Button, Row, Col } from 'react-bootstrap'

export default class FullDetailsWnd extends Component {
    renderData() {
        let output = []
        const { data } = this.props

        console.log(data)

        for (let key in data) {
            output.push(
                <Row key={key}>
                    <Col md={4}><p>{key}</p></Col>
                    <Col md={8}><p>{data[key]}</p></Col>
                </Row>
            )
        }

        return (
            <div>{output}</div>
        )
    }

    render() {
        const { show, onClose, data } = this.props

        if (!data) {
            return <div></div>
        }

        return (
            <div>
                <Modal show={show} onHide={onClose}>
                    <Modal.Header closeButton>
                        {this.props.heading}
                    </Modal.Header>

                    <Modal.Body style={{ height: '600px', overflowY: 'auto' }}>
                        {this.renderData()}
                    </Modal.Body>

                    <Modal.Footer>
                        <Button onClick={onClose}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}

FullDetailsWnd.propTypes = {
    heading: PropTypes.string,
    show: PropTypes.bool,
    data: PropTypes.object,
    onClose: PropTypes.func.isRequired
}
