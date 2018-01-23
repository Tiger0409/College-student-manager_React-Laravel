import React, { PropTypes, Component } from 'react'
import ObjHelper from './../../utils/ObjHelper.js'
import PromiseHelper from './../../utils/PromiseHelper.js'
import { Modal, Button, Panel } from 'react-bootstrap'
import StringHelper from './../../utils/StringHelper.js'
import DataLoader from '../common/DataLoader.jsx'
import Notifier from '../.././utils/Notifier.js'
import moment from 'moment'
import Dh from '../../utils/DateHelper.js'

const EventController = {}

export default class Test extends React.Component {
    constructor(props, context) {
        super(props, context)
        this.state = { a: '', b: '', result: '' }
        this.onChange = this.onChange.bind(this)
        this.test = this.test.bind(this)
    }

    test() {
        Notifier.success('test')
        Notifier.error('error!')
    }

    onChange(e) {
        this.setState({ [e.target.name]: e.target.value })
    }

    render() {
        const { a, b, result } = this.state

        return (
            <div>
                <Button onClick={this.test}>Calc</Button>
            </div>
        )
    }
}


class ConfirmDialog extends Component {
    render() {
        const {
            onHide,
            show,
        } = this.props

        return (
            <Modal show={show} onHide={onHide}>
                <Modal.Dialog>
                    <Modal.Header closeButton>
                        <p>Success</p>
                    </Modal.Header>

                    <Modal.Body>
                        Course updated
                    </Modal.Body>

                    <Modal.Footer>
                        <Button>ok</Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal>
        )
    }
}