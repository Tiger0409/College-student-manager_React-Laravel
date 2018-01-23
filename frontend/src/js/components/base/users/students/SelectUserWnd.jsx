import React, { PropTypes, Component } from 'react'
import { Modal, Button } from 'react-bootstrap'
import { Html, FormField } from '../../../common/FormWidgets.jsx'
import SearchBar from '../../UserSearchBar.jsx'

export default class SelectUserWnd extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { userId: null }
        this.headerStyle = { textAlign: 'center', fontSize: '14pt' }
        this.close = this.close.bind(this)
        this.ok = this.ok.bind(this)
    }

    close() {
        this.setState({ userId: '' })
        this.props.onClose()
    }

    ok() {
        const { userId } = this.state
        const { onSelect } = this.props
        onSelect(userId)
        this.close()
    }

    render() {
        const {
            headerText,
            show,
        } = this.props

        const { userId } = this.state

        return (
            <Modal show={show} onHide={this.close}>
                <Modal.Dialog>
                    <Modal.Header closeButton>
                        <p style={this.headerStyle}>{headerText}</p>
                    </Modal.Header>

                    <Modal.Body>
                        <FormField label='Find it using search bar' width={12}>
                            <SearchBar
                                elemId='newUserSelect'
                                onSelectResult={userId => this.setState({ userId: userId })}
                            />
                        </FormField>

                        <FormField label='Or type correct id' width={12}>
                            <input
                                type='text'
                                name='userId'
                                className='form-control'
                                value={userId}
                                onChange={e => this.setState({ userId: e.target.value })}
                            />
                        </FormField>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button onClick={this.close}>Cancel</Button>
                        <Button onClick={this.ok} style={{ marginLeft: '15px' }}>Ok</Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal>
        )
    }
}

SelectUserWnd.propTypes = {
    headerText: PropTypes.string,
    onSelect: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    show: PropTypes.bool
}